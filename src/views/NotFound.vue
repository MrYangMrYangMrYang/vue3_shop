<!--
  @fileoverview 404 兜底页
  @module components/NotFound
  @description 路由未匹配时展示，提供返回首页入口
-->
<template>
  <div class="not-found">
    <van-empty description="页面走丢了">
      <van-button round type="primary" class="back-btn" @click="goHome">返回首页</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.replace('/')
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.back-btn {
  background: var(--primary-gradient);
  border: none;
  padding: 0 32px;
}
</style>
