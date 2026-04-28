<!-- 
  @fileoverview 订单评价组件
  @module components/order/eveluate
  @description 负责用户对已完成订单的评价内容录入与发布提交，
               提供文本域输入与字数限制，评价成功后自动返回订单列表
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /order/eveluate?orderid=123 (需要登录)
  <router-link :to="{ path: '/order/eveluate', query: { orderid: 123 } }">去评价</router-link>
-->
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
// 订单评价页：
// 负责提交评价内容并在成功后返回上一页。
import { useRouter, useRoute } from "vue-router"
import { ref, reactive, onBeforeMount } from "vue"
import { POST } from "@/services/request"
import { showSuccessToast, showFailToast } from "vant"
import { useUserStore } from "@/stores/user"
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取用户信息
var login = userStore.userInfo || {}
var busid = login.hasOwnProperty("id") ? login.id : 0
var orderid = getRouteQueryValue(route.query, 'orderid', 0)
let values = ref("")

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

  if (isBizFail(result)) {
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