<!--
  @fileoverview 错误边界组件
  @module components/common/ErrorBoundary
  @description 捕获子组件树渲染期的错误，显示降级 UI 避免整页白屏，
               支持重置错误状态重新渲染子组件、刷新页面
  @example
  // 包裹需要保护的组件树
  <ErrorBoundary>
    <component :is="Component" />
  </ErrorBoundary>
-->
<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary" role="alert">
    <van-empty image="error" :description="description">
      <div class="error-actions">
        <van-button round type="primary" class="action-btn" @click="retry">重试</van-button>
        <van-button round plain class="action-btn" @click="reload">刷新页面</van-button>
      </div>
      <p v-if="errorDetail" class="error-detail">{{ errorDetail }}</p>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue'

defineOptions({ name: 'ErrorBoundary' })

const error = ref<unknown>(null)

const description = '页面开小差了，请稍后重试'
/** 开发环境透出错误信息，便于定位；生产环境不暴露技术细节 */
const errorDetail = computed(() => (import.meta.env.DEV && error.value instanceof Error ? error.value.message : ''))

onErrorCaptured((err: unknown) => {
  error.value = err
  console.error('[ErrorBoundary]', err)
  // 阻止错误继续向上冒泡到全局 errorHandler（已在此处理）
  return false
})

/** 重置错误状态，slot 内容将重新渲染 */
const retry = (): void => {
  error.value = null
}

/** 刷新当前页面 */
const reload = (): void => {
  location.reload()
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 16px;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  min-width: 160px;
  height: 40px;
  font-weight: 500;
}

.action-btn.van-button--primary {
  background: var(--primary-gradient);
  border: none;
}

.error-detail {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary);
  word-break: break-all;
  max-width: 280px;
}
</style>
