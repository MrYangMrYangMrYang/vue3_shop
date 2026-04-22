<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="title">加入我们</h1>
        <p class="subtitle">开启您的优选购物之旅</p>
      </div>

      <div class="register-card">
        <van-form @submit="register">
          <van-cell-group inset border={false}>
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
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="rules.password"
              left-icon="lock"
            />
          </van-cell-group>

          <div class="action-btn">
            <van-button round block type="primary" native-type="submit">
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
</style>

<script setup>
  //创建响应式数据
  // ref - 简单类型的响应式数据
  // reactive - 复杂类型的响应式数据
  // toRef - 从复杂类型中抽离单个 响应式属性出来
  // toRefs - 从复杂类型中抽离多个 响应式属性出来
  // readonly - 设置属性只读
  import {reactive} from 'vue'
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast} from 'vant'
  import {useRouter} from 'vue-router'
  import { useCookies } from "vue3-cookies";

  const {cookies} = useCookies();

  // 初始化路由的跳转函数
  const router = useRouter()

  //获取cookie
  var buscheck = cookies.get('business') ? cookies.get('business') : {};

  //说明对象中没有属性存在
  if(Object.keys(buscheck).length > 0)
  {
    router.push('business/index')
  }

  //初始化数据
  let business = reactive({
    mobile:'',
    password:''
  })

  //验证规则
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

  //提交方法
  let register = async (values) => 
  {
    //组装数据
    var data = {
      mobile: values.mobile,
      password: values.password
    };

    var result = await POST({
      url: 'business/register',
      params: data
    })

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }else
    {
      showSuccessToast({
        message: result.msg,
        onClose: () => {
          router.push(result.url)
        }
      })
    }
  }
</script>