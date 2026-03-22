<template>
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <router-link to="/business/profile">
    <div class="myBox">
      <div class="L"><img :src="business.avatar_text"/></div>
      <div class="C">
        <div class="tit">{{business.nickname}}</div>
        <div class="sub">{{business.mobile}}</div>
      </div>
      <div class="R"><img src="/images/go.png" /></div>
    </div>
  </router-link>
  <div class="clear"></div>
  <div class="allkbox"></div>

  <!-- 基本资料 -->
  <router-link to="/business/profile">
    <div class="myboxcon">
      <p>基本资料</p>
      <img src="/images/go.png">
    </div>
  </router-link>

  <!-- 邮箱验证 -->
  <router-link to="/business/email" v-if="business.auth == '0'">
  <div class="myboxcon">
    <p>邮箱认证</p>
    <img src="/images/go.png">
  </div>
  </router-link>

  <!-- 收货地址 -->
  <router-link to="/business/address/index">
    <div class="myboxcon">
      <p>收货地址</p>
      <img src="/images/go.png">
    </div>
  </router-link>

  <!-- 我的订单 -->
  <router-link to="/order/index">
    <div class="myboxcon">
      <p>我的订单</p>
      <img src="/images/go.png">
    </div>
  </router-link>

  <!-- 消费记录 -->
  <!-- <div class="myboxcon">
    <p>消费记录</p>
    <img src="/images/go.png">
  </div> -->

  <!-- 账号注销 -->
  <div class="myboxcon" @click="logout" id="zx">
    <p>账号注销</p>
    <img src="/images/go.png">
  </div>
  
  <Menu />
</template>

<script setup>
  // 添加这一行，定义组件名称
  defineOptions({
    name: 'business'
  })

  import Menu from '@/components/common/Menu.vue'
  import { useCookies } from "vue3-cookies";
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import {useRouter} from 'vue-router'
  import {reactive} from 'vue'

  //初始化
  const {cookies} = useCookies()
  const router = useRouter()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  const business = reactive(login)
  // console.log(business)


  let logout = () => 
  {
    showConfirmDialog({
      title: '注销提醒',
      message: '是否确认退出',
    })
      .then(() => {
        //删除cookie
        cookies.remove('business')

        // 提醒跳转
        showSuccessToast({
          message: '退出登录',
          duration:500,
          onClose: () => 
          {
            router.push('/login')
          }
        })
      })
      .catch(() => {
        // on cancel
      });
  }
</script>