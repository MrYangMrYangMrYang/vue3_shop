import { ref, computed, onBeforeUnmount } from 'vue'
import { getRemainingTime, isPaymentExpired, formatCountdown } from '@/utils/countdown'

/**
 * 倒计时 Hook
 * @param {Function} getOrders - 获取订单列表的函数，返回订单数组
 * @param {Function} isPendingFn - 判断是否待支付的函数
 * @description 自动管理待支付订单倒计时，每秒更新，无待支付订单时自动停止
 */
export function useCountdown(getOrders, isPendingFn) {
  const countdownMap = ref({})
  let timer = null

  const tick = () => {
    const map = {}
    let hasPending = false
    const orders = typeof getOrders === 'function' ? getOrders() : []

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

  const startCountdown = () => {
    stopCountdown()
    tick()
  }

  const stopCountdown = () => {
    if (timer) { clearTimeout(timer); timer = null }
  }

  onBeforeUnmount(stopCountdown)

  return { countdownMap, startCountdown, stopCountdown }
}
