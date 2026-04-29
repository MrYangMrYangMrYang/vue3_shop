<!-- 
  @fileoverview 邮箱验证组件
  @module components/business/email
  @description 负责用户邮箱真实性验证：提供验证码发送与校验功能，确保账号安全，
               是账号安全体系的重要组成部分
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /business/email (需要登录)
  <router-link to="/business/email">邮箱认证</router-link>
-->
<template>
  <div class="email-verify-page">
    <van-nav-bar
      title="邮箱验证"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="verify-container">
      <div class="user-info-section">
        <div class="avatar-wrapper">
          <img :src="business.avatar_text || '/images/tx.png'" @error="handleAvatarError" />
        </div>
        <div class="tip-text">为了您的账号安全，请完成邮箱验证</div>
      </div>

      <div class="verify-card card-item">
        <van-form @submit="email">
          <van-cell-group inset :border="false">
            <!-- 邮箱 -->
            <van-field 
              v-model="business.email" 
              name="email" 
              label="邮箱地址" 
              readonly
              class="readonly-field"
            />
          
            <!-- 验证码 -->
            <van-field
              v-model="emcode"
              name="code"
              center
              clearable
              label="验证码"
              placeholder="请输入验证码"
            >
              <template #button>
                <span 
                  class="send-link" 
                  @click="send"
                  v-if="!click && !sendingCode"
                >
                  发送验证码
                </span>
                <span class="send-link disabled" v-else>
                  <template v-if="sendingCode">发送中...</template>
                  <template v-else>{{ content }}</template>
                </span>
              </template>
            </van-field>
          </van-cell-group>

          <div class="action-btn">
            <van-button round block type="primary" native-type="submit" :loading="verifying" :disabled="verifying">
              立即验证
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.email-verify-page {
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

.verify-container {
  padding: 40px 20px;
}

.user-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tip-text {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.card-item {
  background: white;
  border-radius: 20px;
  padding: 24px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

.readonly-field :deep(.van-field__control) {
  color: var(--text-secondary);
}

/* 新的文字链接样式 */
.send-link {
  color: var( --primary-color);
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 4px;
  user-select: none;
  transition: color 0.2s;
}

.send-link:active {
  opacity: 0.7;
}

.send-link.disabled {
  color: var( --primary-color);
  cursor: not-allowed;
  pointer-events: none;
}

.action-btn {
  margin-top: 32px;
}

:deep(.van-button--primary) {
  background: var(--primary-gradient);
  border: none;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2);
}
</style>

<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref, onBeforeUnmount } from 'vue'
import { showSuccessToast, showFailToast } from 'vant'
import { POST } from '@/services/request'
import { useUserStore } from '@/stores/user'
import { isBizFail } from '@/utils/result'

const userStore = useUserStore()
const router = useRouter()

var login = userStore.userInfo || {}
const business = reactive(login)
const emcode = ref('')

const back = () => { router.go(-1) }

/** 头像加载失败处理 */
const handleAvatarError = (e) => { e.target.src = '/images/tx.png' }

let content = ref('发送验证码')
let sec = ref(60)
let T
let click = ref(false)
const sendingCode = ref(false)
const verifying = ref(false)

/** 发送邮箱验证码 */
const send = async () => {
  if (click.value || sendingCode.value) return false

  sendingCode.value = true
  try {
    var result = await POST({ url: '/business/email', params: { email: business.email } })

    if (isBizFail(result)) { showFailToast(result.msg); return false }

    showSuccessToast(result.msg)

    click.value = true
    T = setInterval(() => {
      sec.value--
      content.value = sec.value + 's后可重新发送'
      if (sec.value <= 0) { clearInterval(T); content.value = '重新发送'; sec.value = 60; click.value = false }
    }, 1000)
  } catch (error) {
    showFailToast('发送失败，请稍后重试')
  } finally {
    sendingCode.value = false
  }
}

/** 提交验证码 */
const email = async (values) => {
  if (verifying.value) return false

  var data = { email: values.email, code: values.code, id: business.id }

  verifying.value = true
  try {
    var result = await POST({ url: '/business/emailcheck', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    showSuccessToast({
      message: result.msg,
      onClose: () => { router.go(-1) }
    })
  } catch (error) {
    showFailToast('验证失败，请稍后重试')
  } finally {
    verifying.value = false
  }

  return false
}

onBeforeUnmount(() => { if (T) clearInterval(T) })
</script>