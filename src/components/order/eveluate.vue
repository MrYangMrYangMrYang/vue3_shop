<template>
  <div>
    <van-sticky>
      <!-- 导航栏 -->
      <van-nav-bar
        title="订单评价"
        left-arrow
        left-text="返回"
        @click-left="back"
      />
    </van-sticky>

    <van-cell-group inset>
      <van-field v-model="values" placeholder="亲 请输入您的评价哦" />
    </van-cell-group>

    <center>
      <van-button type="primary" class="heg" @click="sub">提交</van-button>
    </center>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router"
import { ref, reactive, onBeforeMount } from "vue"
import { POST } from "@/services/request"
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant"
import { useCookies } from "vue3-cookies"

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

// 获取用户信息
var login = cookies.get("business") ? cookies.get("business") : {}
var busid = login.hasOwnProperty("id") ? login.id : 0
var orderid = route.query.orderid ? route.query.orderid : 0
let values = ref("")

// console.log(orderid)

const back = () => {
  router.go(-1)
}

const sub = async () => {
  var result = await POST({
    url: "/order/eveluate",
    params: { 
      busid: busid,
      orderid: orderid,
      content: values.value 
    },
  })

  if (result.code == 0) {
    showFailToast({
      message: result.msg,
    })
  }else{
    showSuccessToast({
      message:result.msg,
       onClose: () => {
        router.go(-1)
      },
    })  
  }
}
</script>

<style scoped>
.heg {
  margin-top: 20px;
}
</style>