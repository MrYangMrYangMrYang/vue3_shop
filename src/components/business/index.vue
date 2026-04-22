<template>
  <div class="profile-page">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="user-info-card">
        <router-link to="/business/profile" class="user-link">
          <div class="avatar-wrapper">
            <img :src="userInfo.avatar_text || defaultAvatar" class="avatar" @error="handleAvatarError" />
          </div>
          <div class="user-detail">
            <div class="nickname">{{ userInfo.nickname || (isLoggedIn ? '未设置昵称' : '点击登录') }}</div>
            <div class="mobile">{{ userInfo.mobile || (isLoggedIn ? '暂无手机号' : '登录后体验更多功能') }}</div>
          </div>
          <van-icon name="arrow" color="rgba(255,255,255,0.7)" />
        </router-link>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="function-list">
      <van-cell-group inset>
        <van-cell title="我的订单" is-link to="/order/index" icon="orders-o" />
        <van-cell title="收货地址" is-link to="/business/address/index" icon="location-o" />
        <van-cell title="基本资料" is-link to="/business/profile" icon="user-o" />
        <van-cell v-if="userInfo.auth == '0'" title="邮箱认证" is-link to="/business/email" icon="envelop-o" />
      </van-cell-group>

      <van-cell-group inset class="mt-12">
        <van-cell title="退出登录" is-link @click="logout" icon="log-out" class="logout-cell" />
      </van-cell-group>
    </div>
    
    <Menu />
  </div>
</template>

<style scoped>
.profile-page {
  background: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* 用户头部 - 简洁版 */
.user-header {
  background: var(--primary-gradient);
  padding: 60px 20px 40px;
  border-radius: 0 0 24px 24px;
}

.user-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

/* 头像 */
.avatar-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  margin-right: 16px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 用户信息 */
.user-detail {
  flex: 1;
}

.nickname {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.mobile {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

/* 功能列表 */
.function-list {
  margin-top: 12px;
  padding: 0 12px;
}

.mt-12 {
  margin-top: 12px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

:deep(.van-cell) {
  padding: 14px 16px;
  font-size: 15px;
}

:deep(.van-cell__left-icon) {
  font-size: 20px;
  color: var(--primary-color);
  margin-right: 12px;
}

.logout-cell {
  color: var(--danger-color);
}

:deep(.logout-cell .van-cell__left-icon) {
  color: var(--danger-color);
}

:deep(.logout-cell .van-cell__title) {
  color: var(--danger-color);
}
</style>

<script setup>
defineOptions({ name: 'business' })

import Menu from '@/components/common/Menu.vue'
import { useCookies } from "vue3-cookies"
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'

const { cookies } = useCookies()
const router = useRouter()

const defaultAvatar = '/images/default-avatar.png'
const login = cookies.get('business') ? cookies.get('business') : {}
const userInfo = reactive(login)

// 是否已登录
const isLoggedIn = computed(() => userInfo.id && userInfo.id > 0)

// 头像加载失败时使用默认图
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

// 退出登录
const logout = () => {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      cookies.remove('business')
      showSuccessToast({
        message: '已退出登录',
        duration: 1500,
        onClose: () => {
          router.replace('/login')
        }
      })
    })
    .catch(() => {})
}
</script>