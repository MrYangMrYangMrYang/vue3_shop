<template>
  <div class="order-list-page">
    <van-sticky>
      <van-nav-bar title="我的订单" left-arrow @click-left="back" class="custom-nav" />

      <van-tabs v-model:active="active" animated @change="TabChange" sticky offset-top="46px">
        <van-tab title="全部" name="0"></van-tab>
        <van-tab title="待发货" name="1"></van-tab>
        <van-tab title="待收货" name="2"></van-tab>
        <van-tab title="待评价" name="3"></van-tab>
        <van-tab title="已完成" name="4"></van-tab>
        <van-tab title="售后" name="-1"></van-tab>
      </van-tabs>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="refresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :offset="10"
        :immediate-check="false"
        finished-text="没有更多订单了"
        @load="load"
      >
        <div class="order-container">
          <div class="order-card" v-for="order in list" :key="order.id">
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
                  <span class="label">实付:</span>
                  <span class="currency">¥</span>
                  <span class="amount">{{ order.amount }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <van-button size="small" round class="btn-detail" @click="goinfo(order.id)">订单详情</van-button>

              <van-button v-if="order.status == '1'" size="small" round class="btn-action primary" @click="cuihahuo">催发货</van-button>

              <van-button v-if="order.status == '2' && order.exfasscode" size="small" round class="btn-action" @click="express(order.id)">查看物流</van-button>

              <van-button v-if="order.status == '2'" size="small" round class="btn-action primary" @click="confirm(order.id)">确认收货</van-button>

              <van-button v-if="order.status == '3'" size="small" round class="btn-action warning" @click="eveluate(order.id)">评价晒单</van-button>

              <van-button v-if="order.status == '4'" size="small" round class="btn-action danger" @click="depot(order.id)">申请售后</van-button>

              <van-button v-if="order.status == '-1'" size="small" round disabled class="btn-action">售后审核中</van-button>
            </div>
          </div>

          <van-empty v-if="list.length === 0 && !loading" description="暂无相关订单" image="orders-o">
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
</style>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { POST } from '@/services/request'
import { showToast, showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useCookies } from 'vue3-cookies'

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

const login = cookies.get('business') ? cookies.get('business') : {}
const busid = login.hasOwnProperty('id') ? login.id : 0

const active = ref('0')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
let page = ref(1)

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

// 状态样式类名映射
const getStatusClass = (status) => {
  const statusStr = String(status)
  if (statusStr === '-1') return 'status--1'
  return `status-${statusStr}`
}

const back = () => {
  router.go(-1)
}

const TabChange = () => {
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []
  load()
}

const refresh = async () => {
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []
  await OrderData()
  refreshing.value = false
}

const load = async () => {
  if (refreshing.value) {
    refreshing.value = false
  }
  await OrderData()
}

const OrderData = async () => {
  const result = await POST({
    url: '/order/index',
    params: {
      busid: busid,
      status: active.value,
      page: page.value,
    }
  })

  loading.value = false

  if (result.code == 0 || !result.data || result.data.length <= 0) {
    finished.value = true
  } else {
    // 处理数据，确保每条订单都有状态文本和样式类
    const processedData = result.data.map(item => ({
      ...item,
      status_text: getStatusText(item.status),
      status_class: getStatusClass(item.status)
    }))
    list.value = list.value.concat(processedData)
    page.value++
  }
}

const cuihahuo = () => {
  showToast('亲，已经在催了哟！')
}

const confirm = (orderid) => {
  showConfirmDialog({
    title: '确认收货提示',
    message: '您是否要确认收货',
  })
    .then(async () => {
      const result = await POST({
        url: '/order/conrce',
        params: { busid: busid, orderid: orderid },
      })
      if (result.code == 0) {
        showFailToast(result.msg)
      } else {
        showSuccessToast(result.msg)
        refresh()
      }
    })
    .catch(() => {})
}

const depot = (orderid) => {
  showConfirmDialog({
    title: '退货提示',
    message: '您是否要进行退货',
  })
    .then(async () => {
      const result = await POST({
        url: '/order/depot',
        params: { busid: busid, orderid: orderid },
      })
      if (result.code == 0) {
        showFailToast(result.msg)
      } else {
        showSuccessToast(result.msg)
        refresh()
      }
    })
    .catch(() => {})
}

const eveluate = (id) => {
  router.push({ path: '/order/eveluate', query: { orderid: id } })
}

const goinfo = (id) => {
  router.push({ path: '/order/info', query: { orderid: id } })
}

const express = (orderid) => {
  router.push({ path: '/order/express', query: { orderid: orderid } })
}

// 页面加载时初始化数据
onBeforeMount(async () => {
  page.value = 1
  finished.value = false
  loading.value = true
  list.value = []
  await OrderData()
})
</script>