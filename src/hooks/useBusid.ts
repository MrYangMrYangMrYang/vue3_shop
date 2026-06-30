/**
 * @module hooks/useBusid
 * @description 获取当前登录用户 ID，统一收口散落在各组件中的登录态取值逻辑
 */

import { useUserStore } from '@/stores/user'

/**
 * 获取当前登录用户 ID
 * @returns 用户 ID，未登录返回 0
 */
export function useBusid(): number {
  const userStore = useUserStore()
  const login = userStore.userInfo || {}
  return Object.hasOwn(login, 'id') ? (login.id ?? 0) : 0
}
