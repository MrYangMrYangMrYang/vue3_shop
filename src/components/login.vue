<template>
  <div class="login-wrapper">
    <div class="login-bg"></div>
    <div class="login-content">
      <div class="avatar-container">
        <img src="/images/tx.png" class="avatar" />
      </div>
      <div class="login-card">
        <h2 class="login-title">欢迎登录</h2>
        <van-form @submit="login">
          <van-cell-group inset>
            <van-field
              v-model="business.mobile"
              name="mobile"
              label="手机号码"
              placeholder="请输入手机号码"
              :rules="rules.mobile"
            />
            <van-field
              v-model="business.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="rules.password"
            />
          </van-cell-group>
          <div class="btn-wrapper">
            <van-button round block native-type="submit" class="login-btn">登 录</van-button>
          </div>
        </van-form>
        <div class="login-footer">
          <router-link to="/register" class="register-link">
            没有账号？立即注册
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {reactive} from 'vue'
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast} from 'vant'
  import {useRouter} from 'vue-router'
  import { useCookies } from "vue3-cookies";

  const {cookies} = useCookies();
  const router = useRouter()

  var buscheck = cookies.get('business') ? cookies.get('business') : {};

  if(Object.keys(buscheck).length > 0)
  {
    router.push('/business/index')
  }

  let business = reactive({
    mobile:'',
    password:''
  })

  let rules = reactive({
    mobile: [
      {
        required: true,
        message: '请输入手机号码',
      },
      {
        pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
        message: '手机号码格式有误'
      }
    ],
    password: [
      {
        required: true,
        message: '请输入密码',
      },
      {
        pattern: /.{6,}/,
        message: '密码只要6位以上'
      }
    ]
  })

  let login = async (values) => {
    var data = {
        mobile:values.mobile,
        password: values.password
    }

    var result = await POST({
        url: 'business/login',
        params: data
    })

    console.log(result)

    if(result.code == 0)
    {
        showFailToast(result.msg)
        return false
    }

    showSuccessToast({
        message: result.msg,
        onClose: () => {
            cookies.set('business', result.data)
            router.push(result.url)
        }
    })
  }
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-color);
}

.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 70, 78, 0.8) 0%, rgba(255, 138, 92, 0.8) 100%);
  z-index: -1;
}

.login-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.avatar-container {
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(255, 70, 78, 0.3);
}

.login-card {
  width: 100%;
  max-width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px 24px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 32px;
  letter-spacing: 1px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
  background: transparent;
}

:deep(.van-field) {
  background: #f7f8fa !important;
  margin-bottom: 16px;
  border-radius: 12px !important;
  padding: 12px 16px;
}

.btn-wrapper {
  margin-top: 32px;
}

.login-btn {
  background: var(--primary-gradient) !important;
  border: none !important;
  color: white !important;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(255, 70, 78, 0.25);
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.register-link {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
}

.register-link::after {
  content: ' >';
  color: var(--primary-color);
  font-weight: 600;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

:deep(.van-field) {
  border-radius: 12px;
  background: #F7F8FA;
  margin-bottom: 12px;
  padding: 16px;
}

:deep(.van-field__label) {
  color: #969799;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: #323233;
}

:deep(.van-button--success) {
  background: linear-gradient(135deg, #FF464E 0%, #FF8A5C 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(255, 70, 78, 0.4);
}

:deep(.van-button--success:active) {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(255, 70, 78, 0.3);
}
</style>
