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
            <div class="company-name">{{ expressInfo.expName || '京东快递' }}</div>
            <div class="tracking-info">
              <span class="tracking-no">运单号：{{ list.exfasscode || 'JD008927315546' }}</span>
              <van-icon name="copy-o" class="copy-icon" @click="copyTrackingNo" />
            </div>
          </div>
        </div>
      </div>

      <!-- 物流步骤条 -->
      <div class="express-card steps-card">
        <div class="card-title">物流轨迹</div>
        <div class="steps-timeline">
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
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { POST } from '@/services/request'
import { showToast, showFailToast } from 'vant'
import { useCookies } from 'vue3-cookies'

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

const login = cookies.get('business') || {}
const busid = login.id || 0
const orderid = route.query.orderid || 0

const list = ref([])
const expressInfo = ref({})

const back = () => {
  router.go(-1)
}

const copyTrackingNo = () => {
  const textarea = document.createElement('textarea')
  textarea.value = list.value.exfasscode || ''
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  showToast('复制成功')
}

onBeforeMount(async () => {
  const result = await POST({
    url: '/order/express',
    params: {
      busid: busid,
      orderid: orderid
    }
  })

  if (result.code == 0) {
    showFailToast({
      message: result.msg,
      onClose: () => {
        router.go(-1)
      }
    })
    return
  }

  list.value = result.data
  expressInfo.value = result.data
})
</script>