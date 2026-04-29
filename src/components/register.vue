<!-- 
  @fileoverview 注册页面组件
  @module components/register
  @description 负责新用户账号注册：提供手机号与密码输入验证（格式校验）及账号创建提交，
               注册成功后自动写入用户状态并跳转到个人中心，已登录用户自动跳转
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
                <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="showPassword = !showPassword" class="eye-icon" />
              </template>
            </van-field>
          </van-cell-group>

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
  margin-top: 32px;
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
</style>

<script setup>
import { reactive, onBeforeMount, ref } from 'vue'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { isBizFail } from '@/utils/result'

const userStore = useUserStore()
const submitting = ref(false)
const showPassword = ref(false)
const router = useRouter()

/** 已登录则跳转个人中心 */
onBeforeMount(() => {
  if (userStore.userInfo) router.push('/business/index')
})

/** 注册表单数据 */
let business = reactive({ mobile: '', password: '' })

/** 表单验证规则 */
let rules = reactive({
  mobile: [
    { required: true, message: '请输入手机号码' },
    { pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/, message: '手机号码格式有误' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: /.{6,}/, message: '密码只要6位以上' }
  ]
})

/** 提交注册 */
let register = async (values) => {
  if (submitting.value) return false
  var data = { mobile: values.mobile, password: values.password }

  submitting.value = true
  try {
    var result = await POST({ url: 'business/register', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    showSuccessToast({
      message: result.msg,
      onClose: () => { router.push(result.url) }
    })
  } catch (error) {
    showFailToast('注册失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>