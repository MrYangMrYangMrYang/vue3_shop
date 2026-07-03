<!-- 
  @fileoverview 订单列表组件
  @module components/order/index
  @description 负责多状态订单展示（全部、待付款、待发货、待收货等），支持下拉刷新、上拉加载及各状态下的业务操作，
               包括付款、取消、催发货、物流查询、确认收货、评价晒单、申请售后等功能
  @requires stores/user
  @requires services/request
  @requires constants/order
  @requires utils/countdown
  @example
  // 路由配置: /order/index (需要登录)
  // 状态筛选: ?status=-2 (待付款), ?status=1 (待发货)
  <router-link to="/order/index">我的订单</router-link>
-->
<template>
  <div class="order-list-page">
    <van-sticky>
      <van-nav-bar title="我的订单" left-arrow @click-left="back" class="custom-nav" />

      <van-tabs v-model:active="active" animated @change="TabChange" sticky offset-top="46px">
        <van-tab title="全部" :name="ORDER_STATUS.ALL"></van-tab>
        <van-tab title="待付款" :name="ORDER_STATUS.PENDING_PAYMENT"></van-tab>
        <van-tab title="待发货" :name="ORDER_STATUS.PENDING_SHIP"></van-tab>
        <van-tab title="待收货" :name="ORDER_STATUS.PENDING_RECEIVE"></van-tab>
        <van-tab title="待评价" :name="ORDER_STATUS.PENDING_REVIEW"></van-tab>
        <van-tab title="已完成" :name="ORDER_STATUS.COMPLETED"></van-tab>
        <van-tab title="售后" :name="ORDER_STATUS.AFTER_SALE"></van-tab>
      </van-tabs>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="refresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :offset="10"
        :immediate-check="false"
        :finished-text="finishedText"
        @load="load"
      >
        <div class="order-container">
          <OrderCard
            v-for="order in list"
            :key="order.id"
            :order="order"
            :countdown-time="countdownMap[order.id] || '30:00'"
            :is-loading="isLoadingOrder(order.id)"
            :is-disappearing="disappearingOrderIds.has(order.id)"
            @detail="goinfo"
            @pay="payOrder"
            @cancel="cancelOrder"
            @urge="cuihahuo"
            @express="express"
            @confirm="confirmReceive"
            @evaluate="evaluate"
            @after-sale="applyAfterSale"
          />

          <van-empty v-if="list.length === 0 && !loading" image="default" description="没有更多订单了">
            <van-button round type="primary" class="go-shop-btn" to="/">去选购商品</van-button>
          </van-empty>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onBeforeMount, onBeforeUnmount, nextTick } from 'vue'
import { POST, isCancel } from '@/services/request'
import {
  showToast,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  closeToast,
  showConfirmDialog,
  showDialog
} from 'vant'
import { usePendingPaymentStore } from '@/stores/pendingPayment'
import { ORDER_STATUS, getOrderStatusText, getOrderStatusClass, isPendingPayment } from '@/constants/order'
import { isBizFail } from '@/utils/result'
import { getCache, setCache } from '@/utils/cache'
import { isPaymentExpired } from '@/utils/countdown'
import { useCountdown, useBack, useAbortController, useBusid } from '@/hooks'
import OrderCard from '@/components/order/OrderCard.vue'

/** 订单列表项（后端订单 + 本地待支付/已完成订单的字段并集） */
interface OrderListItem {
  id: string | number
  code?: string
  status?: string | number
  status_text?: string
  status_class?: string
  thumbs_text?: string
  name_text?: string
  createtime_text?: string
  createtime?: string | number
  amount?: number
  exfasscode?: string | number
  _isLocalPending?: boolean
  created_at?: number
}

/** 通用操作执行器参数 */
interface ExecuteActionOptions {
  url: string
  params: Record<string, unknown>
  orderid: string | number
  confirmTitle: string
  confirmMessage: string
  successMsg: string
  failMsg: string
  onSuccess?: () => void
}

/** 订单列表视图状态缓存 */
interface OrderListCache {
  active?: string | number
  page?: number
  finished?: boolean
  list?: OrderListItem[]
  scrollTop?: number
}

const router = useRouter()
const route = useRoute()
const pendingPaymentStore = usePendingPaymentStore()

const back = useBack()
/** 组件级取消信号：卸载时自动取消未完成的列表请求 */
const signal = useAbortController()

const busid = useBusid()

const active = ref('0')
const list = ref<OrderListItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
/** 正在执行操作的订单ID集合（per-order loading，避免一个订单的操作禁用所有订单按钮） */
const loadingOrderIds = ref(new Set<string | number>())
const isLoadingOrder = (orderid: string | number): boolean => loadingOrderIds.value.has(orderid)
const setOrderLoading = (orderid: string | number, loading: boolean): void => {
  const next = new Set(loadingOrderIds.value)
  if (loading) next.add(orderid)
  else next.delete(orderid)
  loadingOrderIds.value = next
}
const disappearingOrderIds = ref(new Set<string | number>())
const { countdownMap, startCountdown, stopCountdown } = useCountdown(() => list.value, isPendingPayment)
const page = ref(1)
const ORDER_LIST_CACHE_KEY = 'order:list:view-state'
const finishedText = computed(() => (list.value.length === 0 ? '' : '没有更多订单了'))

/** 恢复列表状态缓存 */
const restoreOrderListState = () => {
  const cached = getCache<OrderListCache>(ORDER_LIST_CACHE_KEY)
  if (!cached || typeof cached !== 'object') return false

  active.value = String(cached.active ?? '0')
  page.value = Number(cached.page) || 1
  finished.value = Boolean(cached.finished)
  list.value = Array.isArray(cached.list) ? cached.list : []
  return list.value.length > 0
}

/** 保存列表状态到缓存 */
const saveOrderListState = () => {
  setCache(
    ORDER_LIST_CACHE_KEY,
    {
      active: active.value,
      page: page.value,
      finished: finished.value,
      list: list.value,
      scrollTop: window.scrollY || 0
    },
    10 * 60 * 1000
  )
}

/** Tab切换时重新加载 */
const TabChange = () => {
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []

  load()
}

/** 下拉刷新 */
const refresh = async () => {
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []
  await OrderData()
  refreshing.value = false
}

/** 加载更多 */
const load = async () => {
  if (refreshing.value) refreshing.value = false
  await OrderData()
}

/** 加载订单数据（合并本地待支付/已完成订单） */
const OrderData = async () => {
  try {
    const result = await POST({
      url: '/order/index',
      params: {
        busid: busid,
        status: active.value,
        page: page.value
      },
      signal
    })

    if (isBizFail(result) || !Array.isArray(result.data) || result.data.length <= 0) {
      if (pendingPaymentStore.orders.length > 0 && page.value === 1) {
        const isAllOrPending =
          String(active.value) === String(ORDER_STATUS.ALL) ||
          String(active.value) === String(ORDER_STATUS.PENDING_PAYMENT)
        if (isAllOrPending) {
          const localPendingOrders = pendingPaymentStore.orders.map(order => ({
            ...order,
            status_text: '待支付',
            status_class: getOrderStatusClass(ORDER_STATUS.PENDING_PAYMENT)
          }))
          list.value = list.value.concat(localPendingOrders)
          startCountdown()
        }
      }

      finished.value = true
    } else {
      const processedData = result.data.map(item => ({
        ...item,
        status_text: getOrderStatusText(item.status),
        status_class: getOrderStatusClass(item.status)
      }))

      if (pendingPaymentStore.orders.length > 0 && page.value === 1) {
        // 始终排除已在本地待支付列表中的服务端订单（避免同一订单出现在两个 tab）
        // 用 String() 归一化 ID 类型：后端可能返回 number，本地存储可能是 string
        const localOrderIds = new Set(pendingPaymentStore.orders.map(o => String(o.id)))
        const processedDataFiltered = processedData.filter(item => !localOrderIds.has(String(item.id)))

        const isAllOrPending =
          String(active.value) === String(ORDER_STATUS.ALL) ||
          String(active.value) === String(ORDER_STATUS.PENDING_PAYMENT)
        if (isAllOrPending) {
          const localPendingOrders = pendingPaymentStore.orders.map(order => ({
            ...order,
            status_text: '待支付',
            status_class: getOrderStatusClass(ORDER_STATUS.PENDING_PAYMENT)
          }))
          list.value = list.value.concat(localPendingOrders, processedDataFiltered)
        } else {
          list.value = list.value.concat(processedDataFiltered)
        }
      } else {
        list.value = list.value.concat(processedData)
      }

      page.value++
      saveOrderListState()
      startCountdown()
    }
  } catch (error) {
    // 组件卸载导致的取消，静默退出，不触发 finished 避免误标列表结束
    if (isCancel(error)) return
    finished.value = true
  } finally {
    loading.value = false
  }
}

/** 通用操作执行器（确认弹窗 + API调用） */
const executeAction = async (options: ExecuteActionOptions): Promise<void> => {
  const { url, params, orderid, confirmTitle, confirmMessage, successMsg, failMsg } = options
  if (isLoadingOrder(orderid)) return

  try {
    await showConfirmDialog({
      title: confirmTitle,
      message: confirmMessage,
      confirmButtonColor: '#FF464E'
    })
  } catch {
    return
  }

  setOrderLoading(orderid, true)
  try {
    const result = await POST({ url, params })
    if (isBizFail(result)) {
      showFailToast(result.msg || failMsg)
    } else {
      showSuccessToast(result.msg || successMsg)
      if (options.onSuccess) {
        options.onSuccess()
      }
      refresh()
    }
  } catch (error) {
    showFailToast(failMsg)
  } finally {
    setOrderLoading(orderid, false)
  }
}

/** 支付订单（区分本地/服务端） */
const payOrder = (orderid: string | number): void => {
  if (isLoadingOrder(orderid)) {
    return
  }

  const order = list.value.find(o => o.id === orderid)

  if (order) {
    if (isPaymentExpired(order.createtime)) {
      showFailToast('支付已超时，请重新下单')
      return
    }
  }

  showConfirmDialog({
    title: '支付确认',
    message: '确认支付该订单？',
    confirmButtonColor: '#FF464E'
  })
    .then(async () => {
      setOrderLoading(orderid, true)

      if (String(orderid).startsWith('LOCAL_')) {
        try {
          showLoadingToast({ message: '支付中...', forbidClick: true, duration: 0 })
          const result = await pendingPaymentStore.placeOrder(orderid)
          closeToast()

          if (result.success) {
            showDialog({
              title: '🎉 支付成功',
              message: '您的订单已支付完成！商家将尽快为您发货。',
              confirmButtonText: '查看订单',
              confirmButtonColor: '#FF464E'
            }).then(() => {
              active.value = ORDER_STATUS.PENDING_SHIP
              TabChange()
            })
          } else {
            showFailToast(result.msg || '支付失败，请稍后重试')
          }
        } catch (err) {
          closeToast()
          showFailToast('支付失败：' + (err instanceof Error ? err.message : '未知错误'))
        } finally {
          setOrderLoading(orderid, false)
        }
        return
      }

      // 非本地订单兜底（新方案下待付款列表仅含 LOCAL_ 订单，不应走到此分支）
      setOrderLoading(orderid, false)
      showFailToast('订单状态异常')
    })
    .catch(error => {
      if (isLoadingOrder(orderid)) {
        setOrderLoading(orderid, false)
      }
      // Vant 取消时 reject 的 DialogInstance 无 .message 字段，不应视为异常
      if (error?.message) {
        showFailToast('支付异常：' + error.message)
      }
    })
}

/** 取消订单（本地订单动画删除，服务端调用API） */
const cancelOrder = (orderid: string | number): void => {
  const isLocalOrder = String(orderid).startsWith('LOCAL_')

  if (isLocalOrder) {
    showConfirmDialog({
      title: '取消订单',
      message: '确认取消该订单？取消后不可恢复',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想',
      confirmButtonColor: '#ff464e'
    })
      .then(() => {
        const localOrder = pendingPaymentStore.getPendingOrder(orderid)
        disappearingOrderIds.value.add(orderid)

        setTimeout(() => {
          pendingPaymentStore.removePendingOrder(orderid)
          // 立即购买模式的临时购物车记录需清理
          if (localOrder?.action === 'buy' && localOrder?.cartids) {
            POST({ url: '/cart/delbuy', params: { cartid: localOrder.cartids, busid } }).catch(() => {})
          }
          list.value = list.value.filter(o => o.id !== orderid)
          disappearingOrderIds.value.delete(orderid)
          showToast('订单已取消')
        }, 400)
      })
      .catch(() => {})
  } else {
    executeAction({
      url: '/order/cancel',
      params: { busid, orderid },
      orderid,
      confirmTitle: '取消订单',
      confirmMessage: '确认取消该订单？取消后不可恢复',
      successMsg: '订单已取消',
      failMsg: '取消订单失败，请稍后重试',
      onSuccess: () => {
        pendingPaymentStore.removePendingOrder(orderid)
      }
    })
  }
}

/** 催发货 */
const cuihahuo = () => {
  showToast('亲，已经在催了哟！')
}

/** 确认收货 */
const confirmReceive = (orderid: string | number): void => {
  executeAction({
    url: '/order/conrce',
    params: { busid, orderid },
    orderid,
    confirmTitle: '确认收货提示',
    confirmMessage: '您是否要确认收货',
    successMsg: '确认收货成功',
    failMsg: '确认收货失败，请稍后重试'
  })
}

/** 申请售后 */
const applyAfterSale = (orderid: string | number): void => {
  executeAction({
    url: '/order/depot',
    params: { busid, orderid },
    orderid,
    confirmTitle: '退货提示',
    confirmMessage: '您是否要进行退货',
    successMsg: '申请售后成功',
    failMsg: '申请售后失败，请稍后重试'
  })
}

/** 跳转评价页 */
const evaluate = (id: string | number): void => {
  router.push({ path: '/order/evaluate', query: { orderid: id } })
}

/** 跳转订单详情 */
const goinfo = (id: string | number): void => {
  router.push({ path: '/order/info', query: { orderid: id } })
}

/** 跳转物流查询 */
const express = (orderid: string | number): void => {
  router.push({ path: '/order/express', query: { orderid } })
}

onBeforeMount(async () => {
  pendingPaymentStore.clearIncompleteOrders()
  pendingPaymentStore.startAutoClean()

  const queryStatus = route.query.status
  if (queryStatus !== undefined && queryStatus !== '') {
    active.value = String(queryStatus)
    page.value = 1
    finished.value = false
    loading.value = true
    list.value = []
    await OrderData()
    return
  }

  const restored = restoreOrderListState()
  if (restored) {
    await nextTick()
    startCountdown()
    const cached = getCache<OrderListCache>(ORDER_LIST_CACHE_KEY)
    const scrollTop = Number(cached?.scrollTop || 0)
    window.scrollTo(0, scrollTop)
    return
  }
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []
  await OrderData()
})

onBeforeUnmount(() => {
  saveOrderListState()
  stopCountdown()
  pendingPaymentStore.stopAutoClean()
})
</script>

<style scoped>
.order-list-page {
  background: var(--bg-color);
  min-height: 100vh;
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

:deep(.van-tabs__line) {
  background-color: var(--primary-color);
}

:deep(.van-tab--active) {
  color: var(--primary-color);
  font-weight: 600;
}

.order-container {
  padding: var(--spacing-md);
}

.go-shop-btn {
  width: 160px;
  background: var(--primary-gradient);
  border: none;
}
</style>
