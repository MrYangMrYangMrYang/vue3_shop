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

    <div class="order-content" v-if="list && list.id">
      <!-- 状态与物流 -->
      <div class="status-card">
        <div class="status-header">
          <van-icon name="clock-o" class="status-icon" />
          <span class="status-text">{{ list.status_text }}</span>
        </div>

        <div
          v-if="isPendingPayment(list.status) && !isPaymentExpired(list.createtime)"
          class="countdown-bar"
        >
          <van-icon name="clock-o" />
          <span>剩余付款时间: {{ countdownText || '计算中...' }}</span>
        </div>

        <div class="express-info" v-if="expressData">
          <div class="express-item">
            <van-icon name="logistics" />
            <span>{{ expressData.expName }}: {{ list.exfasscode }}</span>
          </div>
          <div class="express-item" v-if="expressData.courier">
            <van-icon name="manager-o" />
            <span>联系人: {{ expressData.courier }} ({{ expressData.courierPhone }})</span>
          </div>
        </div>
        <div v-else class="no-express">暂无物流信息</div>
      </div>

      <!-- 地址信息 -->
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

      <!-- 商品清单 -->
      <div class="goods-card card-item">
        <div class="card-title">商品信息</div>
        <div class="product-item" v-for="pro in prolist" :key="pro.id">
          <van-card :num="pro.pronum" :price="pro.price" :title="pro.ordproduct.name" :thumb="pro.ordproduct.thumbs_text" />
        </div>
        <div class="contact-service" @click="contacts">
          <van-icon name="chat-o" />
          <span>联系客服</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="price-card card-item">
        <div class="card-title">支付信息</div>
        <van-cell title="商品总价" :value="'¥' + formatAmount(price)" />
        <van-cell title="运费" value="¥0.00" />
        <van-cell title="实付款" :value="'¥' + formatAmount(price)" class="total-price" />
      </div>

      <!-- 订单信息 -->
      <div class="order-meta card-item">
        <div class="card-title">订单信息</div>
        <div class="meta-item">
          <span class="label">订单编号</span>
          <div class="value-wrapper">
            <span class="value">{{ list.code }}</span>
            <van-icon name="copy-o" class="copy-icon" @click="copyOrderNo" />
          </div>
        </div>
        <div class="meta-item">
          <span class="label">下单时间</span>
          <span class="value">{{ list.createtime_text }}</span>
        </div>
        <div class="meta-item" v-if="list.paytime_text">
          <span class="label">付款时间</span>
          <span class="value">{{ list.paytime_text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

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

.status-card {
  background: var(--card-bg);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bg-color);
}

.status-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.countdown-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: #fff5f5;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #ff464e;
}

.countdown-bar .van-icon {
  font-size: 14px;
}

.express-info {
  font-size: 13px;
  color: var(--text-primary);
}

.express-item {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.express-item:first-child {
  margin-top: 0;
}

.express-item .van-icon {
  margin-right: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.no-express {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px 0;
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

.card-title {
  padding: 14px 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.van-card) {
  background: transparent;
  padding: 8px 16px;
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

.total-price :deep(.van-cell__value) {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 16px;
}

.order-meta {
  padding: 0 16px 12px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg-color);
}

.meta-item:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
  font-size: 13px;
}

.value {
  color: var(--text-primary);
  font-size: 13px;
}

.value-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.copy-icon:active {
  color: var(--primary-color);
}
</style>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount, onBeforeUnmount, computed } from 'vue'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { copyText } from '@/utils/clipboard'
import {
  ORDER_STATUS,
  getOrderStatusText,
  isPendingPayment,
  isCancelled
} from '@/constants/order'
import { roundToTwo, formatCurrency } from '@/utils/currency'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { getRemainingTime, isPaymentExpired, formatCountdown } from '@/utils/countdown'
import { useCompletedLocalOrdersStore } from '@/stores/completedLocalOrders'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const completedLocalOrdersStore = useCompletedLocalOrdersStore()

const login = userStore.userInfo || {}
const busid = login.hasOwnProperty('id') ? login.id : 0

const orderid = getRouteQueryValue(route.query, 'orderid', 0)

const list = ref({})
const prolist = ref([])
const contact = ref('')
const expressData = ref([])
const countdownText = ref('')
let countdownTimer = null

const formatAmount = (amount) => formatCurrency(amount)

const back = () => {
  router.go(-1)
}

const copyOrderNo = () => {
  copyText(list.value.code || '')
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

const startCountdown = () => {
  stopCountdown()
  const tick = () => {
    if (isPendingPayment(list.value.status) && !isPaymentExpired(list.value.createtime)) {
      const remaining = getRemainingTime(list.value.createtime)
      countdownText.value = formatCountdown(remaining)
      countdownTimer = setTimeout(tick, 1000)
    } else {
      countdownText.value = ''
    }
  }
  tick()
}

const stopCountdown = () => {
  if (countdownTimer) {
    clearTimeout(countdownTimer)
    countdownTimer = null
  }
}

const refreshData = async () => {
  await Promise.allSettled([
    getInfo(),
    expressinfo(),
    getproductinfo()
  ])
  startCountdown()
}

onBeforeMount(async () => {
  const isLocalOrder = String(orderid).startsWith('LOCAL_')
  
  if (isLocalOrder) {
    const localOrder = completedLocalOrdersStore.orders.find(o => o.id === orderid)
    
    if (localOrder) {
      list.value = {
        ...localOrder,
        status_text: localOrder.status_text || getOrderStatusText(localOrder.status),
        address: null,
        paytime_text: new Date().toLocaleString('zh-CN')
      }
      
      prolist.value = [{
        id: localOrder.id,
        pronum: 1,
        price: localOrder.amount,
        total: localOrder.amount,
        ordproduct: {
          name: localOrder.name_text || '未知商品',
          thumbs_text: localOrder.thumbs_text || ''
        }
      }]
      
      expressData.value = null
    } else {
      showFailToast('本地订单信息不存在')
      setTimeout(() => router.go(-1), 1500)
    }
  } else {
    await Promise.allSettled([
      getInfo(),
      expressinfo(),
      getproductinfo()
    ])
    startCountdown()
  }
})

onBeforeUnmount(() => {
  stopCountdown()
})

const getInfo = async () => {
  try {
    const result = await POST({
      url: '/order/addressinfo',
      params: { busid: busid, orderid: orderid },
    })
    if (isBizFail(result) || !result.data) {
      showFailToast(result.msg || '订单信息加载失败')
      return
    }
    const data = result.data
    if (data) {
      data.status_text = getOrderStatusText(data.status)
    }
    list.value = data
  } catch (error) {
    showFailToast('订单信息加载失败，请稍后重试')
  }
}

const expressinfo = async () => {
  try {
    const result = await POST({
      url: '/order/express',
      params: { busid: busid, orderid: orderid },
    })
    expressData.value = isBizFail(result) ? null : result.data
  } catch (error) {
    expressData.value = null
  }
}

const getproductinfo = async () => {
  try {
    const result = await POST({
      url: '/order/proinfo',
      params: { busid: busid, orderid: orderid },
    })
    if (isBizFail(result) || !result.data) {
      return
    }
    contact.value = result.data.contact
    prolist.value = result.data.prolist || []
  } catch (error) {
    prolist.value = []
  }
}

const price = computed(() => {
  let count = 0
  prolist.value.map((item) => {
    count += roundToTwo(item.total)
  })
  return roundToTwo(count)
})
</script>
