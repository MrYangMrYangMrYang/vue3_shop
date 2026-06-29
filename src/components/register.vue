<!--
  @fileoverview 注册页面组件
  @module components/register
  @description 负责新用户账号注册：提供手机号、密码、确认密码、短信验证码四项表单字段
               及用户协议勾选，包含手机号格式校验、密码一致性校验、验证码 60 秒倒计时、协议弹窗预览，
               注册成功后自动跳转，已登录用户自动跳转个人中心
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /register (无需登录，已登录自动跳转)
  <router-link to="/register">注册</router-link>
-->
<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="title">加入我们</h1>
        <p class="subtitle">开启您的优选购物之旅</p>
      </div>

      <div class="register-card">
        <van-form @submit="register">
          <van-cell-group inset :border="false">
            <van-field
              v-model="business.mobile"
              name="mobile"
              label="手机号码"
              placeholder="请输入手机号码"
              :rules="rules.mobile"
              left-icon="phone-o"
            />

            <van-field
              v-model="business.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="rules.password"
              left-icon="lock"
            >
              <template #right-icon>
                <van-icon
                  :name="showPassword ? 'eye-o' : 'closed-eye'"
                  @click="showPassword = !showPassword"
                  class="eye-icon"
                />
              </template>
            </van-field>

            <van-field
              v-model="business.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="rules.confirmPassword"
              left-icon="lock"
            >
              <template #right-icon>
                <van-icon
                  :name="showPassword ? 'eye-o' : 'closed-eye'"
                  @click="showPassword = !showPassword"
                  class="eye-icon"
                />
              </template>
            </van-field>

            <van-field
              v-model="business.code"
              name="code"
              label="验证码"
              placeholder="请输入短信验证码"
              :rules="rules.code"
              left-icon="shield-o"
              maxlength="6"
              type="digit"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  :disabled="codeCooldown > 0 || !isMobileValid"
                  @click.prevent="sendCode"
                  class="code-btn"
                >
                  {{ codeCooldown > 0 ? `${codeCooldown}s 后重试` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>

          <div class="agreement">
            <van-checkbox v-model="agreed" shape="square" checked-color="#FF464E">
              我已阅读并同意
              <a href="javascript:;" @click.prevent="showAgreement('用户协议', AGREEMENT_TEXT)">《用户协议》</a>
              和
              <a href="javascript:;" @click.prevent="showAgreement('隐私政策', PRIVACY_TEXT)">《隐私政策》</a>
            </van-checkbox>
          </div>

          <div class="action-btn">
            <van-button round block type="primary" native-type="submit" :loading="submitting" :disabled="submitting">
              立即注册
            </van-button>
          </div>
        </van-form>

        <div class="footer-links">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onBeforeMount, onUnmounted, ref, computed } from 'vue'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast, showDialog, type FieldRule } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { isBizFail } from '@/utils/result'
import { MOBILE_PATTERN, PASSWORD_PATTERN, SMS_CODE_PATTERN, isMobile } from '@/utils/validate'

const userStore = useUserStore()
const submitting = ref(false)
const showPassword = ref(false)
const agreed = ref(false)
const codeCooldown = ref(0)
let codeTimer: ReturnType<typeof setInterval> | null = null
const router = useRouter()

/** 演示项目无真实短信网关，协议文本为展示用途 */
const AGREEMENT_TEXT =
  '欢迎您使用本商城服务。注册即代表您同意遵守平台各项规则，合法使用账号，不得进行恶意刷单、虚假交易等行为。我们保留对违规账号采取限制措施的权利。'
const PRIVACY_TEXT =
  '我们重视您的隐私。注册时收集的手机号仅用于身份识别与订单通知，不会向第三方泄露您的个人信息，法律法规另有规定的除外。'

/** 已登录则跳转个人中心 */
onBeforeMount(() => {
  if (userStore.userInfo) router.push('/business/index')
})

/** 注册表单数据 */
const business = reactive<{ mobile: string; password: string; confirmPassword: string; code: string }>({
  mobile: '',
  password: '',
  confirmPassword: '',
  code: ''
})

/** 手机号是否合法（控制验证码按钮可用性） */
const isMobileValid = computed(() => isMobile(business.mobile))

/** 表单验证规则 */
const rules = reactive<Record<string, FieldRule[]>>({
  mobile: [
    { required: true, message: '请输入手机号码' },
    { pattern: MOBILE_PATTERN, message: '手机号码格式有误' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: PASSWORD_PATTERN, message: '密码只要6位以上' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: (val: string) => val === business.password,
      message: '两次输入的密码不一致'
    }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { pattern: SMS_CODE_PATTERN, message: '验证码为6位数字' }
  ]
})

/** 发送短信验证码（演示项目无真实网关，仅前端倒计时） */
const sendCode = (): void => {
  if (codeCooldown.value > 0) return
  if (!isMobileValid.value) {
    showFailToast('请先输入正确的手机号')
    return
  }
  showSuccessToast('验证码已发送')
  codeCooldown.value = 60
  codeTimer = setInterval(() => {
    codeCooldown.value--
    if (codeCooldown.value <= 0) {
      clearInterval(codeTimer!)
      codeTimer = null
    }
  }, 1000)
}

/** 查看协议或政策 */
const showAgreement = (title: string, content: string): void => {
  showDialog({
    title,
    message: content,
    confirmButtonColor: '#FF464E',
    confirmButtonText: '我知道了'
  })
}

/** 提交注册 */
const register = async (values: Record<string, any>): Promise<boolean | void> => {
  if (submitting.value) return false
  if (!agreed.value) {
    showFailToast('请先阅读并同意用户协议')
    return false
  }

  // 后端注册接口仅识别 mobile + password，验证码字段做前端校验后不提交
  const data = { mobile: values.mobile, password: values.password }

  submitting.value = true
  try {
    const result = await POST({ url: 'business/register', params: data })
    if (isBizFail(result)) {
      showFailToast(result.msg || '注册失败')
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => {
        router.push(result.url)
      }
    })
  } catch (error) {
    showFailToast('注册失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onUnmounted(() => {
  if (codeTimer) clearInterval(codeTimer)
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.register-container {
  padding: 40px 20px;
}

.register-header {
  margin-bottom: 40px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.register-card {
  background: white;
  border-radius: 20px;
  padding: 24px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.action-btn {
  margin-top: 24px;
  padding: 0 16px;
}

:deep(.van-button--primary) {
  background: var(--primary-gradient);
  border: none;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.3);
}

.footer-links {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-link {
  color: var(--primary-color);
  font-weight: 500;
  margin-left: 4px;
}

:deep(.van-field) {
  padding: 16px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

.eye-icon {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.eye-icon:active {
  color: var(--primary-color);
}

/* ========== 用户协议 ========== */
.agreement {
  padding: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.agreement :deep(.van-checkbox__label) {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-left: 8px;
}

.agreement a {
  color: var(--primary-color);
  text-decoration: none;
}

/* ========== 验证码按钮 ========== */
.code-btn {
  background: var(--primary-gradient) !important;
  border: none !important;
  border-radius: 14px !important;
  padding: 0 12px;
  height: 28px;
  font-size: 12px;
  white-space: nowrap;
}

.code-btn:disabled {
  opacity: 0.6;
}
</style>
