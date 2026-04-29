<!-- 
  @fileoverview 个人中心首页组件
  @module components/business/index
  @description 负责用户信息概览展示、常用功能入口导航（订单、地址、邮箱认证等），
               是用户个人中心的入口页面，提供快捷操作入口与用户状态展示
  @requires stores/user
  @requires components/common/Menu
  @example
  // 路由配置: /business/index (需要登录)
  <router-link to="/business/index">个人中心</router-link>
-->
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
            <div class="mobile">{{ maskedMobile || (isLoggedIn ? '暂无手机号' : '登录后体验更多功能') }}</div>
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
        <van-cell v-if="userInfo.auth == '0'" title="邮箱认证" is-link to="/business/email" icon="envelop-o" />
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
  margin-top: -14px;
  padding: 0 12px;
  position: relative;
  z-index: 2;
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
</style>

<script setup>
defineOptions({ name: 'business' })

import Menu from '@/components/common/Menu.vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'

const userStore = useUserStore()
const router = useRouter()

const defaultAvatar = '/images/tx.png'
const userInfo = reactive(userStore.userInfo || {})

/** 是否已登录 */
const isLoggedIn = computed(() => userInfo.id && userInfo.id > 0)
const maskedMobile = computed(() => maskMobile(userInfo.mobile))

/** 手机号脱敏 */
const maskMobile = (mobile) => {
  if (!mobile) return ''
  const mobileStr = String(mobile).trim()
  if (!/^1\d{10}$/.test(mobileStr)) return mobileStr
  return `${mobileStr.slice(0, 3)}****${mobileStr.slice(7)}`
}

/** 头像加载失败处理 */
const handleAvatarError = (e) => { e.target.src = defaultAvatar }
</script>