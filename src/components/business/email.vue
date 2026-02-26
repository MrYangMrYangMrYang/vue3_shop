<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="邮箱验证"
    left-text="返回"
    left-arrow
    @click-left="back"
  />

  <div style="margin-top:60px;">
    <img :src="business.avatar_text" style="display:block;border-radius:50%;width:36%;heigth:36%;margin:auto"/>
  </div>
  <van-form @submit="email">
    <van-cell-group inset>
      <!-- 邮箱 -->
      <van-field v-model="business.email" name="email" label="邮箱" readonly/>
    
      <!-- 验证码 -->
      <van-field
        v-model="emcode"
        name="code"
        center
        clearable
        label="验证码"
        placeholder="请输入邮箱验证码"
      >
        <template #button>
          <van-button class="ss" size="small" type="success" @click="send" :disabled="click">{{content}}</van-button>
        </template>
      </van-field>
    </van-cell-group>
    <van-button round block type="primary" native-type="submit" size="small" style="width:50%;margin:40px auto 0;">确认</van-button>
  </van-form>
</template>

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