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
          <img :src="business.avatar_text" />
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
                <van-button 
                  size="small" 
                  type="primary" 
                  @click="send" 
                  :disabled="click"
                  class="send-btn"
                >
                  {{ content }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>

          <div class="action-btn">
            <van-button round block type="primary" native-type="submit">
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

.send-btn {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0 12px;
}

.send-btn:disabled {
  border-color: var(--text-placeholder);
  color: var(--text-placeholder);
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
  import {useRouter} from 'vue-router'
  import { useCookies } from "vue3-cookies";
  import {reactive, ref} from 'vue'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import {POST} from '@/services/request'

  //初始化
  const {cookies} = useCookies()
  const router = useRouter()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  // console.log(login)
  const business = reactive(login)

  const emcode = ref('')

  //返回上一页
  const back = () =>
  {
    router.go(-1)
  }

  let content = ref('发送验证码')
  let sec = ref(60)
  let T
  let click = ref(false)

  const send = async () =>{
    //发送请求
    var result = await POST({
        url: '/business/email',
        params: {email:business.email}
    })

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast(result.msg);

    // 倒计时
    click.value = true
    T = setInterval(() => {
      sec.value--
      content.value = sec.value + 's后可重新发送'
      if (sec.value <= 0) {
        clearInterval(T);
        content.value = '重新发送'
        sec.value = 60
        click.value = false
        }
    }, 1000);
  }

  //表单提交
  const email = async (values) =>{

    console.log(values);

    //组装数据
    var data = {
      email:values.email,
      code:values.code,
      id:business.id
    }

    //发起请求
    var result = await POST({
      url: '/business/emailcheck',
      params: data
    })

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
        message: result.msg,
        onClose: () => 
        {
          //跳转
          router.go(-1)
        }
    })

    return false

  }

    
</script>