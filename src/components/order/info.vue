<template>
  <div class="order-info-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="back" class="custom-nav" />

    <div class="order-content" v-if="list.address">
      <!-- 状态与物流 - 红色描边 -->
      <div class="status-card">
        <div class="status-header">
          <van-icon name="clock-o" class="status-icon" />
          <span class="status-text">{{ list.status_text }}</span>
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
      <div class="address-card card-item">
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
        <van-cell title="商品总价" :value="'¥' + price" />
        <van-cell title="运费" value="¥0.00" />
        <van-cell title="实付款" :value="'¥' + price" class="total-price" />
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

/* 状态卡片 - 红色描边 */
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
import { ref, onBeforeMount, computed } from 'vue'
import { POST } from '@/services/request'
import { showToast, showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useCookies } from 'vue3-cookies'

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

const login = cookies.get('business') ? cookies.get('business') : {}
const busid = login.hasOwnProperty('id') ? login.id : 0

const orderid = route.query.hasOwnProperty('orderid') ? route.query.orderid : 0

const list = ref([])
const prolist = ref([])
const contact = ref('')
const expressData = ref([])

// 状态文本映射函数
const getStatusText = (status) => {
  const statusMap = {
    '0': '全部',
    '1': '待发货',
    '2': '待收货',
    '3': '待评价',
    '4': '已完成',
    '-1': '售后'
  }
  return statusMap[String(status)] || '未知状态'
}

const back = () => {
  router.go(-1)
}

const copyOrderNo = () => {
  const textarea = document.createElement('textarea')
  textarea.value = list.value.code
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  showToast('复制成功')
}

const contacts = () => {
  showConfirmDialog({
    title: '拨打提醒',
    message: '是否确认拨打客服电话',
  })
    .then(() => {
      location.href = `tel:${contact.value}`
    })
    .catch(() => {})
}

onBeforeMount(async () => {
  await getInfo()
  await expressinfo()
  await getproductinfo()
})

const getInfo = async () => {
  const result = await POST({
    url: '/order/addressinfo',
    params: { busid: busid, orderid: orderid },
  })
  // 处理数据，添加状态文本
  const data = result.data
  if (data) {
    data.status_text = getStatusText(data.status)
  }
  list.value = data
}

const expressinfo = async () => {
  const result = await POST({
    url: '/order/express',
    params: { busid: busid, orderid: orderid },
  })
  expressData.value = result.data
}

const getproductinfo = async () => {
  const result = await POST({
    url: '/order/proinfo',
    params: { busid: busid, orderid: orderid },
  })
  contact.value = result.data.contact
  prolist.value = result.data.prolist
}

const price = computed(() => {
  let count = 0
  prolist.value.map((item) => {
    count += parseFloat(item.total)
  })
  return count
})
</script>