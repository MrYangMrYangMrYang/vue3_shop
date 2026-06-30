/**
 * @module hooks/useAbortController
 * @description 组件级请求取消：创建 AbortSignal，组件卸载时自动 abort，
 *              配合 request.ts 的 signal 选项实现"卸载即取消未完成请求"，
 *              避免组件销毁后异步回调更新已卸载组件引发警告与内存泄漏
 */

import { onBeforeUnmount, getCurrentInstance } from 'vue'

/**
 * 获取组件级取消信号
 * @returns signal 传入 GET/POST/UPLOAD 的 signal 选项；组件卸载时自动 abort
 */
export function useAbortController(): AbortSignal {
  const controller = new AbortController()
  // 仅在组件 setup 上下文注册卸载回调，兼容 store/工具等非组件场景调用
  if (getCurrentInstance()) {
    onBeforeUnmount(() => controller.abort())
  }
  return controller.signal
}
