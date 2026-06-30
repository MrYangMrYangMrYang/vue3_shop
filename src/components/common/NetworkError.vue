<!--
  @fileoverview 网络错误占位组件
  @module components/common/NetworkError
  @description 数据加载失败时显示的错误占位，提供"重新加载"按钮触发重试，
               替代纯 Toast 提示，让用户能主动恢复页面
  @emits retry - 用户点击重试按钮时触发
  @example
  // 在页面中使用：v-if="hasError" 控制显示
  <NetworkError v-if="hasError" @retry="retryFn" />
-->
<template>
  <div class="network-error" role="alert">
    <van-empty image="error" :description="description">
      <van-button round type="primary" class="retry-btn" @click="$emit('retry')">{{ buttonText }}</van-button>
    </van-empty>
  </div>
</template>

<script setup>
defineOptions({ name: 'NetworkError' })

defineProps({
  description: {
    type: String,
    default: '网络异常，请稍后重试'
  },
  buttonText: {
    type: String,
    default: '重新加载'
  }
})

defineEmits(['retry'])
</script>

<style scoped>
.network-error {
  padding: 40px 0;
}

.retry-btn {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-full);
  padding: 0 32px;
  height: 40px;
  font-weight: 500;
}
</style>
