<!-- 
  @fileoverview 订单详情组件
  @module components/order/info
  @description 负责展示订单的完整业务信息：包括订单状态进度、物流动态、收货人信息、商品清单、费用明细、订单元数据及状态操作按钮，
               是订单查看与操作的核心页面，支持待付款倒计时显示
  @requires stores/user
  @requires services/request
  @requires constants/order
  @requires utils/countdown
  @example
  // 路由配置: /order/info?id=123 (需要登录)
  <router-link :to="{ path: '/order/info', query: { id: 123 } }">订单详情</router-link>
-->
<template>
  <div class="order-info-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="back" class="custom-nav" />

    <!-- 加载态 -->
    <div class="order-content" v-if="loading">
      <van-skeleton title :row="8" class="skeleton-card" />
    </div>

    <!-- 错误态 -->
    <NetworkError v-else-if="hasError" message="订单信息加载失败" @retry="retry" />

    <!-- 空态（API 返回无数据） -->
    <van-empty v-else-if="!list || !list.id" image="search" description="未找到该订单" />

    <!-- 正常数据 -->
    <div class="order-content" v-else>
      <!-- 待付款倒计时 -->
      <div v-if="isPendingPayment(list.status) && !isPaymentExpired(list.createtime)" class="countdown-bar">
        <van-icon name="clock-o" />
        <span class="countdown-label">剩余付款时间</span>
        <span class="countdown-time">{{ countdownText || '30:00' }}</span>
      </div>

      <div class="address-card card-item" v-if="list.address">
        <van-icon name="location-o" class="location-icon" />
        <div class="address-details">
          <div class="user-info">
            <span class="name">{{ list.address.consignee }}</span>
            <span class="tel">{{ list.address.mobile }}</span>
          </div>
          <div class="address-text">{{ list.address.address_text }} {{ list.address.address }}</div>
        </div>
      </div>

      <!-- 订单信息整合卡片：商品 + 费用 + 元数据 -->
      <div class="info-card card-item">
        <!-- 头部：编号 + 状态 -->
        <div class="info-header">
          <span class="order-no">订单号: {{ list.code }}</span>
          <span class="order-status" :style="{ color: statusColor }">{{ list.status_text }}</span>
        </div>

        <!-- 商品列表 -->
        <div class="info-products">
          <div class="product-row" v-for="pro in prolist" :key="pro.id">
            <img v-lazy="pro.ordproduct.thumbs_text" class="product-thumb" :alt="pro.ordproduct.name" />
            <div class="product-meta">
              <div class="product-name">{{ pro.ordproduct.name }}</div>
              <div class="product-price-qty">
                <span class="pprice">¥{{ pro.price }}</span>
                <span class="pqty">×{{ pro.pronum }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="info-divider"></div>
        <div class="info-express" v-if="expressData">
          <van-icon name="logistics" />
          <span>{{ expressData.expName }}: {{ list.exfasscode }}</span>
        </div>

        <!-- 费用明细 -->
        <div class="info-divider"></div>
        <div class="info-fee">
          <div class="fee-row">
            <span class="fee-label">商品总价</span>
            <span class="fee-value">¥{{ formatAmount(price) }}</span>
          </div>
          <div class="fee-row">
            <span class="fee-label">运费</span>
            <span class="fee-value">¥0.00</span>
          </div>
          <div class="fee-row fee-row--total">
            <span class="fee-label">{{ isPendingPayment(list.status) ? '需付款' : '实付款' }}</span>
            <span class="fee-value">¥{{ formatAmount(price) }}</span>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="info-divider"></div>
        <div class="info-meta">
          <div class="meta-row">
            <span class="meta-label">下单时间</span>
            <span class="meta-value">{{ list.createtime_text }}</span>
          </div>
          <div class="meta-row" v-if="list.paytime_text && !isPendingPayment(list.status)">
            <span class="meta-label">付款时间</span>
            <span class="meta-value">{{ list.paytime_text }}</span>
          </div>
        </div>

        <div v-if="!isPendingPayment(list.status)" class="contact-service" @click="contacts">
          <van-icon name="chat-o" />
          <span>联系客服</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount, onBeforeUnmount, computed } from 'vue'
import { POST, isCancel } from '@/services/request'
import NetworkError from '@/components/common/NetworkError.vue'
import { useBack, useCountdown, useAbortController, useBusid } from '@/hooks'
import { showFailToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { getOrderStatusText, getOrderStatusColor, isPendingPayment } from '@/constants/order'
import { roundToTwo, formatAmount } from '@/utils/currency'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { isPaymentExpired } from '@/utils/countdown'
import { usePendingPaymentStore } from '@/stores/pendingPayment'

/** 订单详情（后端返回 + 本地待付款订单的字段并集） */
interface OrderDetail {
  id: string | number
  code?: string
  status?: string | number
  status_text?: string
  createtime?: string | number
  createtime_text?: string
  amount?: number
  exfasscode?: string | number
  paytime_text?: string
  address?: OrderAddress | null
  [key: string]: unknown
}

/** 订单收货地址 */
interface OrderAddress {
  consignee?: string
  mobile?: string
  address_text?: string
  address?: string
  name?: string
  tel?: string
}

/** 订单商品行 */
interface OrderProduct {
  id: string | number
  pronum: number
  price: number
  total: number
  ordproduct: {
    name: string
    thumbs_text: string
  }
}

/** 物流信息 */
interface ExpressInfo {
  expName?: string
  [key: string]: unknown
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pendingPaymentStore = usePendingPaymentStore()

const busid = useBusid()

const orderid = getRouteQueryValue(route.query, 'orderid', 0)

const loading = ref(true)
const hasError = ref(false)
const list = ref<OrderDetail>({} as OrderDetail)
const prolist = ref<OrderProduct[]>([])
const contact = ref('')
const expressData = ref<ExpressInfo | null>(null)

const back = useBack()
/** 组件级取消信号：卸载时自动取消未完成的详情请求 */
const signal = useAbortController()

/** 订单状态颜色（统一从 constants 取色，与 OrderCard 保持一致） */
const statusColor = computed(() => getOrderStatusColor(list.value.status))

const { countdownMap, startCountdown, stopCountdown } = useCountdown(() => [list.value], isPendingPayment)
const countdownText = computed(() => countdownMap.value[list.value.id] || '')

/** 重试加载 */
const retry = () => {
  hasError.value = false
  loading.value = true
  onBeforeMountHandler()
}

const contacts = () => {
  showConfirmDialog({
    title: '拨打提醒',
    message: '是否确认拨打客服电话',
    confirmButtonColor: '#FF464E'
  })
    .then(() => {
      location.href = `tel:${contact.value}`
    })
    .catch(() => {})
}

const onBeforeMountHandler = async () => {
  const isLocalOrder = String(orderid).startsWith('LOCAL_')

  if (isLocalOrder) {
    const localOrder = pendingPaymentStore.orders.find(o => o.id === orderid)

    if (localOrder) {
      // 兼容新旧两种地址字段名格式
      const rawAddr = (localOrder.address || {}) as OrderAddress
      const addr =
        rawAddr.consignee || rawAddr.name
          ? {
              consignee: rawAddr.consignee || rawAddr.name || '',
              mobile: rawAddr.mobile || rawAddr.tel || '',
              address_text: rawAddr.address_text || rawAddr.address || ''
            }
          : null

      // 本地订单无地址时，fallback 到 userStore 中选择的地址
      const selected = userStore.selectedAddress
      const fallbackAddr =
        !addr && selected?.tel
          ? { consignee: selected.name, mobile: selected.tel, address_text: selected.address }
          : null

      list.value = {
        ...localOrder,
        status_text: localOrder.status_text || getOrderStatusText(localOrder.status),
        address: addr || fallbackAddr || null
      }

      prolist.value = [
        {
          id: localOrder.id,
          pronum: 1,
          price: localOrder.amount ?? 0,
          total: localOrder.amount ?? 0,
          ordproduct: {
            name: localOrder.name_text || '未知商品',
            thumbs_text: localOrder.thumbs_text || ''
          }
        }
      ]

      expressData.value = null
      startCountdown()
    } else {
      showFailToast('本地订单信息不存在')
      setTimeout(() => router.go(-1), 1500)
    }
  } else {
    await Promise.allSettled([getInfo(), expressinfo(), getproductinfo()])
    startCountdown()
  }
  loading.value = false
}

onBeforeMount(onBeforeMountHandler)

onBeforeUnmount(() => {
  stopCountdown()
})

const getInfo = async () => {
  try {
    const result = await POST({
      url: '/order/addressinfo',
      params: { busid: busid, orderid: orderid },
      signal
    })
    if (isBizFail(result) || !result.data) {
      hasError.value = true
      return
    }
    const data = result.data as OrderDetail
    if (data) {
      data.status_text = getOrderStatusText(data.status)
    }
    list.value = data
  } catch (error) {
    if (isCancel(error)) return
    hasError.value = true
  }
}

const expressinfo = async () => {
  try {
    const result = await POST({
      url: '/order/express',
      params: { busid: busid, orderid: orderid },
      signal
    })
    expressData.value = isBizFail(result) ? null : (result.data as ExpressInfo)
  } catch (error) {
    if (isCancel(error)) return
    expressData.value = null
  }
}

const getproductinfo = async () => {
  try {
    const result = await POST({
      url: '/order/proinfo',
      params: { busid: busid, orderid: orderid },
      signal
    })
    if (isBizFail(result) || !result.data) {
      return
    }
    const data = result.data as { contact: string; prolist: OrderProduct[] }
    contact.value = data.contact
    prolist.value = data.prolist || []
  } catch (error) {
    if (isCancel(error)) return
    prolist.value = []
  }
}

const price = computed(() => {
  let count = 0
  prolist.value.forEach(item => {
    count += roundToTwo(item.total)
  })
  return roundToTwo(count)
})
</script>

<style scoped>
.order-info-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

.order-content {
  padding: var(--spacing-md);
}

/* ========== 倒计时条 ========== */
.countdown-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
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

/* ========== 整合信息卡片 ========== */
.info-card {
  padding: 16px;
}

/* 头部：编号 + 状态 */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--bg-color);
  margin-bottom: 14px;
}

.order-no {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

/* 商品行 */
.product-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.product-row + .product-row {
  border-top: 1px dashed var(--bg-color);
}

.product-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  background: var(--bg-color);
  flex-shrink: 0;
  object-fit: cover;
}

.product-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pprice {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.pqty {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 区段分隔线 */
.info-divider {
  height: 1px;
  background: var(--bg-color);
  margin: 12px 0;
}

/* 物流信息 */
.info-express {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.info-express .van-icon {
  font-size: 14px;
}

/* 费用明细 */
.fee-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.fee-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.fee-value {
  font-size: 13px;
  color: var(--text-primary);
}

.fee-row--total {
  padding-top: 8px;
}

.fee-row--total .fee-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.fee-row--total .fee-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}

/* 订单元数据 */
.info-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
}

.meta-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-value {
  font-size: 13px;
  color: var(--text-primary);
}

.card-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.address-card {
  display: flex;
  padding: 16px;
  align-items: flex-start;
  gap: 12px;
}

.location-icon {
  font-size: 20px;
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.address-details {
  flex: 1;
}

.user-info {
  margin-bottom: 6px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
}

.tel {
  font-size: 14px;
  color: var(--text-secondary);
}

.address-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
}

.contact-service {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--bg-color);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.contact-service:active {
  background: var(--bg-color);
}
</style>
