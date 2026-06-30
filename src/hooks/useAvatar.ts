/**
 * @module hooks/useAvatar
 * @description 用户头像展示逻辑：自动替换后端默认头像为前端默认头像，及加载失败兜底
 */

import { computed } from 'vue'

/** 后端默认头像 URL 特征（不含域名前缀） */
export const BACKEND_DEFAULT_AVATAR = '/assets/img/tx.jpg'

/** 前端默认头像 */
export const DEFAULT_AVATAR = '/images/tx.png'

/**
 * 获取展示头像 URL（纯函数版，适合非组件场景）
 * @param url 原始头像 URL
 * @returns 处理后的头像 URL
 */
export function getDisplayAvatarUrl(url: string | undefined): string {
  if (!url) return DEFAULT_AVATAR
  if (url.includes(BACKEND_DEFAULT_AVATAR)) return DEFAULT_AVATAR
  return url
}

/**
 * 头像展示 Hook
 * @param avatarUrl 头像 URL getter（ref 或 computed 的取值函数）
 * @returns displayAvatar 显示头像 computed，handleAvatarError 加载失败回调
 */
export function useAvatar(avatarUrl: () => string | undefined) {
  const displayAvatar = computed(() => getDisplayAvatarUrl(avatarUrl()))

  /** 头像加载失败时回退到默认头像 */
  const handleAvatarError = (e: Event): void => {
    ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
  }

  return { displayAvatar, handleAvatarError }
}
