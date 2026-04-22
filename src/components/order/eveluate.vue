<template>
  <div class="evaluate-page">
    <van-nav-bar
      title="发表评价"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="evaluate-container">
      <div class="evaluate-card card-item">
        <div class="section-title">评价内容</div>
        <van-field
          v-model="values"
          rows="4"
          autosize
          type="textarea"
          maxlength="200"
          placeholder="分享您的购物体验，帮助更多小伙伴~"
          show-word-limit
          class="evaluate-input"
        />
      </div>

      <div class="action-btn">
        <van-button round block type="primary" @click="sub">
          发布评价
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evaluate-page {
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

.evaluate-container {
  padding: 12px;
}

.card-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.evaluate-input {
  padding: 12px 16px;
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
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2);
}
</style>

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