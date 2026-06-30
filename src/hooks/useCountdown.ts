/**
 * @module hooks/useCountdown
 * @description 自动管理待支付订单倒计时，每秒更新，无待支付订单时自动停止
 */

import { ref, onBeforeUnmount } from 'vue'
import { getRemainingTime, isPaymentExpired, formatCountdown } from '@/utils/countdown'

export interface CountdownOrder {
  id: string | number
  status?: string | number
  createtime?: string | number
  [key: string]: unknown
}

/**
 * 倒计时 Hook
 * @param getOrders 获取订单列表的函数，返回订单数组
 * @param isPendingFn 判断是否待支付的函数
 */
export function useCountdown<T extends CountdownOrder = CountdownOrder>(
  getOrders: () => T[] | undefined,
  isPendingFn: (status: string | number | undefined) => boolean
) {
  const countdownMap = ref<Record<string, string>>({})
  let timer: ReturnType<typeof setTimeout> | null = null

  const tick = (): void => {
    const map: Record<string, string> = {}
    let hasPending = false
    const orders = typeof getOrders === 'function' ? (getOrders() ?? []) : []

    orders.forEach(order => {
      if (isPendingFn(order.status) && !isPaymentExpired(order.createtime)) {
        hasPending = true
        const remaining = getRemainingTime(order.createtime)
        map[order.id] = formatCountdown(remaining)
      }
    })

    countdownMap.value = map
    if (hasPending) timer = setTimeout(tick, 1000)
  }

  const startCountdown = (): void => {
    stopCountdown()
    tick()
  }

  const stopCountdown = (): void => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onBeforeUnmount(stopCountdown)

  return { countdownMap, startCountdown, stopCountdown }
}
