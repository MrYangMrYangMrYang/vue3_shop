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
          <div class="order-card" :class="{ 'order-disappearing': disappearingOrderIds.has(order.id) }" v-for="order in list" :key="order.id">
            <div
              v-if="isPendingPayment(order.status) && !isPaymentExpired(order.createtime)"
              class="countdown-bar"
            >
              <van-icon name="clock-o" />
              <span class="countdown-label">剩余付款时间</span>
              <span class="countdown-time">{{ countdownMap[order.id] || '30:00' }}</span>
            </div>

            <div class="order-header">
              <span class="order-no">订单号: {{ order.code }}</span>
              <span class="order-status" :class="order.status_class">
                {{ order.status_text }}
              </span>
            </div>

            <div class="order-content" @click="goinfo(order.id)">
              <div class="product-img">
                <img :src="order.thumbs_text" alt="" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ order.name_text }}</div>
                <div class="order-time">{{ order.createtime_text }}</div>
                <div class="order-price">
                  <span class="label">{{ isPendingPayment(order.status) ? '需付:' : '实付:' }}</span>
                  <span class="currency">¥</span>
                  <span class="amount">{{ formatAmount(order.amount) }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <van-button v-if="!isPendingPayment(order.status)" size="small" round class="btn-detail" @click="goinfo(order.id)">订单详情</van-button>

              <van-button
                v-if="isPendingPayment(order.status)"
                size="small"
                round
                class="btn-action primary"
                :loading="actionLoading"
                :disabled="actionLoading || isPaymentExpired(order.createtime)"
                @click="payOrder(order.id)"
              >
                去付款
              </van-button>

              <van-button
                v-if="isPendingPayment(order.status)"
                size="small"
                round
                class="btn-action"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.PENDING_SHIP"
                size="small"
                round
                class="btn-action primary"
                @click="cuihahuo"
              >
                催发货
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.PENDING_RECEIVE && order.exfasscode"
                size="small"
                round
                class="btn-action"
                @click="express(order.id)"
              >
                查看物流
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.PENDING_RECEIVE"
                size="small"
                round
                class="btn-action primary"
                :loading="actionLoading"
                :disabled="actionLoading"
                @click="confirmReceive(order.id)"
              >
                确认收货
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.PENDING_REVIEW"
                size="small"
                round
                class="btn-action warning"
                @click="eveluate(order.id)"
              >
                评价晒单
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.COMPLETED"
                size="small"
                round
                class="btn-action danger"
                :loading="actionLoading"
                :disabled="actionLoading"
                @click="applyAfterSale(order.id)"
              >
                申请售后
              </van-button>

              <van-button
                v-if="order.status === ORDER_STATUS.AFTER_SALE"
                size="small"
                round
                disabled
                class="btn-action"
              >
                售后审核中
              </van-button>

              <van-button
                v-if="isCancelled(order.status)"
                size="small"
                round
                disabled
                class="btn-action"
              >
                已取消
              </van-button>
            </div>
          </div>

          <van-empty
            v-if="list.length === 0 && !loading"
            image="default"
            description="没有更多订单了"
          >
            <van-button round type="primary" class="go-shop-btn" to="/">去选购商品</van-button>
          </van-empty>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

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

.order-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.4s ease-out;
  transform-origin: center;
}

.order-disappearing {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bg-color);
}

.order-no {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

.status-0 {
  color: var(--text-secondary);
}
.status--2 {
  color: #ff464e;
}
.status-1 {
  color: #ff9500;
}
.status-2 {
  color: #07c160;
}
.status-3 {
  color: var(--primary-color);
}
.status-4 {
  color: var(--text-secondary);
}
.status--1 {
  color: #ff976a;
}
.status--3 {
  color: var(--text-placeholder);
}

.countdown-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  margin-bottom: 4px;
  font-size: 13px;
  color: #ff6b00;
  font-weight: 500;
}

.countdown-bar .van-icon {
  font-size: 14px;
}

.countdown-label {
  opacity: 0.85;
}

.countdown-time {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.order-content {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.order-content:active {
  opacity: 0.7;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-color);
  flex-shrink: 0;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.order-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.order-price {
  margin-top: 8px;
  text-align: right;
}

.order-price .label {
  font-size: 12px;
  color: var(--text-primary);
  margin-right: 4px;
}

.order-price .currency {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 700;
}

.order-price .amount {
  font-size: 18px;
  color: var(--primary-color);
  font-weight: 800;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--bg-color);
  flex-wrap: wrap;
}

.btn-detail {
  color: var(--text-secondary);
  border-color: var(--text-placeholder);
}

.btn-action {
  min-width: 80px;
}

.btn-action.primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-action.warning {
  color: #ffbe00;
  border-color: #ffbe00;
}

.btn-action.danger {
  color: var(--text-secondary);
  border-color: var(--text-placeholder);
}

.go-shop-btn {
  width: 160px;
  background: var(--primary-gradient);
  border: none;
}

.order-empty {
  padding: 48px 0 24px;
}
</style>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onBeforeMount, onBeforeUnmount, nextTick } from 'vue'
import { POST } from '@/services/request'
import { showToast, showSuccessToast, showFailToast, showLoadingToast, closeToast, showConfirmDialog, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { usePendingPaymentStore } from '@/stores/pendingPayment'
import { useCompletedLocalOrdersStore } from '@/stores/completedLocalOrders'
import {
  ORDER_STATUS,
  getOrderStatusText,
  getOrderStatusClass,
  isPendingPayment,
  isCancelled
} from '@/constants/order'
import { formatCurrency } from '@/utils/currency'
import { isBizFail } from '@/utils/result'
import { getCache, setCache } from '@/utils/cache'
import { getRemainingTime, isPaymentExpired, formatCountdown } from '@/utils/countdown'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pendingPaymentStore = usePendingPaymentStore()
const completedLocalOrdersStore = useCompletedLocalOrdersStore()

const login = userStore.userInfo || {}
const busid = login.hasOwnProperty('id') ? login.id : 0

const active = ref('0')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const actionLoading = ref(false)
const disappearingOrderIds = ref(new Set())
const countdownMap = ref({})
let page = ref(1)
let countdownTimer = null
const ORDER_LIST_CACHE_KEY = 'order:list:view-state'
const finishedText = computed(() => (list.value.length === 0 ? '' : '没有更多订单了'))

const formatAmount = (amount) => formatCurrency(amount)

/** 启动倒计时（每秒更新待支付订单） */
const startCountdown = () => {
  stopCountdown()
  const tick = () => {
    const map = {}
    let hasPendingPayment = false
    list.value.forEach(order => {
      if (isPendingPayment(order.status) && !isPaymentExpired(order.createtime)) {
        hasPendingPayment = true
        const remaining = getRemainingTime(order.createtime)
        map[order.id] = formatCountdown(remaining)
      }
    })
    countdownMap.value = map
    if (hasPendingPayment) countdownTimer = setTimeout(tick, 1000)
  }
  tick()
}

/** 停止倒计时 */
const stopCountdown = () => {
  if (countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null }
}

/** 恢复列表状态缓存 */
const restoreOrderListState = () => {
  const cached = getCache(ORDER_LIST_CACHE_KEY)
  if (!cached || typeof cached !== 'object') return false

  active.value = String(cached.active ?? '0')
  page.value = Number(cached.page) || 1
  finished.value = Boolean(cached.finished)
  list.value = Array.isArray(cached.list) ? cached.list : []
  return list.value.length > 0
}

/** 保存列表状态到缓存 */
const saveOrderListState = () => {
  setCache(ORDER_LIST_CACHE_KEY, {
    active: active.value,
    page: page.value,
    finished: finished.value,
    list: list.value,
    scrollTop: window.scrollY || 0
  }, 10 * 60 * 1000)
}

const back = () => { router.go(-1) }

/** Tab切换时重新加载 */
const TabChange = (name, title) => {
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
        page: page.value,
      }
    })

    if (isBizFail(result) || !Array.isArray(result.data) || result.data.length <= 0) {
      if (pendingPaymentStore.orders.length > 0 && page.value === 1) {
        const isAllOrPending = String(active.value) === String(ORDER_STATUS.ALL) ||
                               String(active.value) === String(ORDER_STATUS.PENDING_PAYMENT)
        if (isAllOrPending) {
          const localPendingOrders = pendingPaymentStore.orders.map(order => ({
            ...order,
            status_text: '待支付',
            status_class: 'status-pending-payment'
          }))
          list.value = list.value.concat(localPendingOrders)
          startCountdown()
        }
      }

      const isAllTab = String(active.value) === String(ORDER_STATUS.ALL)
      const completedOrdersForTab = isAllTab 
        ? completedLocalOrdersStore.getAllOrders()
        : completedLocalOrdersStore.getOrderByStatus(active.value)
      if (completedOrdersForTab.length > 0 && page.value === 1) {
        list.value = list.value.concat(completedOrdersForTab)
      }

      finished.value = true
    } else {
      const processedData = result.data.map(item => ({
        ...item,
        status_text: getOrderStatusText(item.status),
        status_class: getOrderStatusClass(item.status)
      }))

      if (pendingPaymentStore.orders.length > 0 && page.value === 1) {
        const isAllOrPending = String(active.value) === String(ORDER_STATUS.ALL) ||
                               String(active.value) === String(ORDER_STATUS.PENDING_PAYMENT)
        if (isAllOrPending) {
          const localOrderIds = new Set(pendingPaymentStore.orders.map(o => o.id))
          const serverOrdersWithoutLocal = processedData.filter(item => !localOrderIds.has(item.id))
          const localPendingOrders = pendingPaymentStore.orders.map(order => ({
            ...order,
            status_text: '待支付',
            status_class: 'status-pending-payment'
          }))
          list.value = list.value.concat(localPendingOrders, serverOrdersWithoutLocal)
        } else {
          list.value = list.value.concat(processedData)
        }
      } else {
        list.value = list.value.concat(processedData)
      }

      const isAllTabForCompleted = String(active.value) === String(ORDER_STATUS.ALL)
      const completedOrdersForTab = isAllTabForCompleted
        ? completedLocalOrdersStore.getAllOrders()
        : completedLocalOrdersStore.getOrderByStatus(active.value)
      if (completedOrdersForTab.length > 0 && page.value === 1) {
        const completedOrderIds = new Set(completedOrdersForTab.map(o => o.id))
        const filteredList = list.value.filter(item => !completedOrderIds.has(item.id))
        list.value = filteredList.concat(completedOrdersForTab)
      }

      page.value++
      saveOrderListState()
      startCountdown()
    }
  } catch (error) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

/** 通用操作执行器（确认弹窗 + API调用） */
const executeAction = async (options) => {
  const { url, params, confirmTitle, confirmMessage, successMsg, failMsg, loadingRef } = options
  if (loadingRef.value) return

  try {
    await showConfirmDialog({
      title: confirmTitle,
      message: confirmMessage,
      confirmButtonColor: '#FF464E'
    })
  } catch {
    return
  }

  loadingRef.value = true
  try {
    const result = await POST({ url, params })
    if (isBizFail(result)) {
      showFailToast(result.msg)
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
    loadingRef.value = false
  }
}

/** 支付订单（区分本地/服务端） */
const payOrder = (orderid) => {
  if (actionLoading.value) {
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
      
      const isLocalOrder = String(orderid).startsWith('LOCAL_')
      
      actionLoading.value = true
      
      if (isLocalOrder) {
        try {
          showLoadingToast({
            message: '支付处理中...',
            forbidClick: true,
            duration: 0
          })

          await new Promise(resolve => setTimeout(resolve, 2000))

          closeToast()
          
          const orderIndex = list.value.findIndex(o => o.id === orderid)
          if (orderIndex !== -1) {
            list.value[orderIndex].status = ORDER_STATUS.PENDING_SHIP
            list.value[orderIndex].status_text = '待发货'
            list.value[orderIndex].status_class = getOrderStatusClass(ORDER_STATUS.PENDING_SHIP)
            
            completedLocalOrdersStore.addCompletedOrder(list.value[orderIndex])
          }

          pendingPaymentStore.removePendingOrder(orderid)

          showDialog({
            title: '🎉 支付成功',
            message: '您的订单已支付完成！商家将尽快为您发货。',
            confirmButtonText: '查看订单',
            confirmButtonColor: '#FF464E'
          }).then(() => {
            active.value = ORDER_STATUS.PENDING_SHIP
            TabChange(ORDER_STATUS.PENDING_SHIP, '待发货')
          })
        } catch (error) {
          closeToast()
          showFailToast('支付失败：' + (error.message || '未知错误'))
        } finally {
          actionLoading.value = false
        }
        return
      }
      
      try {
        showLoadingToast({
          message: '支付中...',
          forbidClick: true,
          duration: 0
        })

        const result = await POST({
          url: '/order/pay',
          params: { busid, orderid }
        })

        closeToast()

        if (isBizFail(result)) {
          showFailToast(result.msg || '支付失败')
          return
        }

        pendingPaymentStore.removePendingOrder(orderid)
        showDialog({
          title: '🎉 支付成功',
          message: '您的订单已支付完成！商家将尽快为您发货。',
          confirmButtonText: '查看订单',
          confirmButtonColor: '#FF464E'
        }).then(() => {
          refresh()
        })
      } catch (error) {
        closeToast()
        showFailToast('支付失败：' + (error.message || '网络异常'))
      } finally {
        actionLoading.value = false
      }
    })
    .catch((error) => {

      if (error && actionLoading.value) {
        actionLoading.value = false
      }

      if (error) {
        showFailToast('支付异常：' + (error.message || '未知错误'))
      }
    })
}

/** 取消订单（本地订单动画删除，服务端调用API） */
const cancelOrder = (orderid) => {
  const isLocalOrder = String(orderid).startsWith('LOCAL_')

  if (isLocalOrder) {
    showConfirmDialog({
      title: '取消订单',
      message: '确认取消该订单？取消后不可恢复',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想',
      confirmButtonColor: '#ff464e'
    }).then(() => {
      disappearingOrderIds.value.add(orderid)

      setTimeout(() => {
        pendingPaymentStore.removePendingOrder(orderid)
        list.value = list.value.filter(o => o.id !== orderid)
        disappearingOrderIds.value.delete(orderid)
        showToast('订单已取消')
      }, 400)
    }).catch(() => {})
  } else {
    executeAction({
      url: '/order/cancel',
      params: { busid, orderid },
      confirmTitle: '取消订单',
      confirmMessage: '确认取消该订单？取消后不可恢复',
      successMsg: '订单已取消',
      failMsg: '取消订单失败，请稍后重试',
      loadingRef: actionLoading,
      onSuccess: () => {
        pendingPaymentStore.removePendingOrder(orderid)
      }
    })
  }
}

/** 催发货 */
const cuihahuo = () => { showToast('亲，已经在催了哟！') }

/** 确认收货 */
const confirmReceive = (orderid) => {
  executeAction({
    url: '/order/conrce',
    params: { busid, orderid },
    confirmTitle: '确认收货提示',
    confirmMessage: '您是否要确认收货',
    successMsg: '确认收货成功',
    failMsg: '确认收货失败，请稍后重试',
    loadingRef: actionLoading
  })
}

const applyAfterSale = (orderid) => {
  executeAction({
    url: '/order/depot',
    params: { busid, orderid },
    confirmTitle: '退货提示',
    confirmMessage: '您是否要进行退货',
    successMsg: '申请售后成功',
    failMsg: '申请售后失败，请稍后重试',
    loadingRef: actionLoading
  })
}

/** 跳转评价页 */
const eveluate = (id) => { router.push({ path: '/order/eveluate', query: { orderid: id } }) }

/** 跳转订单详情 */
const goinfo = (id) => { router.push({ path: '/order/info', query: { orderid: id } }) }

/** 跳转物流查询 */
const express = (orderid) => { router.push({ path: '/order/express', query: { orderid } }) }

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
    const cached = getCache(ORDER_LIST_CACHE_KEY)
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
