<template>
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      title="物流信息"
      left-arrow
      left-text="返回"
      @click-left="back" 
    />
  </van-sticky>

  <!-- 步骤条 -->
  <!-- active 属性表示当前步骤的索引，从 0 起计。 -->
  <van-steps direction="vertical" :active="0">
    <van-step v-for="item in list">
      <h3>{{item.status}}</h3>
      <p>{{item.time}}</p>
    </van-step>
  </van-steps>
</template>

<script setup>
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount, computed} from 'vue'
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import { useCookies } from "vue3-cookies";

  const router = useRouter()
  const route = useRoute()
  const {cookies} = useCookies()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  var busid = login.hasOwnProperty('id') ? login.id : 0;
  //获取订单ID
  var orderid = route.query.hasOwnProperty('orderid') ? route.query.orderid : 0;

  var list = ref([])

  const back = () => 
  {
    router.go(-1)
  }

  //生命周期
  onBeforeMount(async () => {
    // 发送请求
    var result = await POST({
      url: '/order/express',
      params: {
        busid: busid,
        orderid: orderid
      }
    })

    if(result.code == 0)
    {
      showFailToast({
        message: result.msg,
        onClose: () => {
          //跳转
          router.go(-1)
        }
      })
      return false
    }

    list.value = result.data.list

    console.log(result.data)
  })
</script>
