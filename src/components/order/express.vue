<!-- 
  @fileoverview 物流详情组件
  @module components/order/express
  @description 负责实时物流轨迹的查询与展示，包括快递公司信息、运单号及各节点的配送进度，
               使用时间轴形式展示物流动态，支持复制运单号功能
  @requires services/request
  @example
  // 路由配置: /order/express?id=123 (需要登录)
  <router-link :to="{ path: '/order/express', query: { id: 123 } }">查看物流</router-link>
-->
<template>
  <div class="express-container">
    <van-sticky>
      <van-nav-bar title="物流详情" left-arrow @click-left="back" class="custom-nav" />
    </van-sticky>

    <div class="express-content">
      <!-- 物流概览卡片 -->
      <div class="express-card overview-card">
        <div class="company-info">
          <van-icon name="logistics" size="24" class="company-icon" />
          <div>
            <div class="company-name">{{ expressInfo.expName || '暂无物流公司信息' }}</div>
            <div class="tracking-info" v-if="list.exfasscode">
              <span class="tracking-no">运单号：{{ list.exfasscode }}</span>
              <van-icon name="copy-o" class="copy-icon" @click="copyTrackingNo" />
            </div>
            <div class="tracking-no" v-else>运单号：暂无</div>
          </div>
        </div>
      </div>

      <!-- 物流步骤条 -->
      <div class="express-card steps-card">
        <div class="card-title">物流轨迹</div>
        <div class="steps-timeline" v-if="list.list && list.list.length">
          <div class="timeline-item" v-for="(item, index) in list.list" :key="index" :class="{ active: index === 0 }">
            <div class="timeline-dot" :class="{ 'active-dot': index === 0 }">
              <van-icon v-if="index === 0" name="checked" size="10" />
            </div>
            <div class="timeline-line" v-if="index !== list.list.length - 1"></div>
            <div class="timeline-content">
              <div class="timeline-status">{{ item.status }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无物流轨迹" image="search" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.express-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon),
:deep(.van-nav-bar__text) {
  color: white !important;
}

.express-content {
  padding: var(--spacing-md);
}

.express-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.company-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.tracking-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tracking-no {
  font-size: 13px;
  color: var(--text-secondary);
}

.copy-icon {
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.copy-icon:active {
  color: var(--primary-color);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bg-color);
}

.steps-timeline {
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 0;
  width: 12px;
  height: 12px;
  background: var(--text-placeholder);
  border-radius: 50%;
  z-index: 2;
}

.timeline-dot.active-dot {
  background: var(--primary-color);
  width: 16px;
  height: 16px;
  left: -22px;
  top: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-dot.active-dot .van-icon {
  color: white;
  font-size: 10px;
}

.timeline-line {
  position: absolute;
  left: -14px;
  top: 12px;
  width: 2px;
  height: calc(100% - 12px);
  background: linear-gradient(to bottom, var(--text-placeholder), transparent);
  z-index: 1;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-status {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.timeline-item.active .timeline-status {
  color: var(--primary-color);
  font-weight: 600;
}

.timeline-time {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>

<script setup>
// 物流详情页：
// 负责物流公司与运单信息展示、轨迹时间线渲染与运单号复制。
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { POST } from '@/services/request'
import { showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { copyText } from '@/utils/clipboard'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const login = userStore.userInfo || {}
const busid = login.id || 0
const orderid = getRouteQueryValue(route.query, 'orderid', 0)

const list = ref({ list: [] })
const expressInfo = ref({})

const back = () => {
  router.go(-1)
}

const copyTrackingNo = () => {
  copyText(list.value.exfasscode || '')
}

onBeforeMount(async () => {
  try {
    const result = await POST({
      url: '/order/express',
      params: {
        busid: busid,
        orderid: orderid
      }
    })

    if (isBizFail(result)) {
      showFailToast({
        message: result.msg,
        onClose: () => {
          router.go(-1)
        }
      })
      return
    }

    const data = result.data || { list: [] }
    list.value = data
    expressInfo.value = data
  } catch (error) {
    showFailToast('物流信息加载失败，请稍后重试')
  }
})
</script>