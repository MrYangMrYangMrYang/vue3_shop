import { ORDER_PAYMENT_TIMEOUT_MS } from '@/constants/order'

/**
 * 计算剩余支付时间（毫秒）
 * @param {string|number} createtime
 * @param {number} [timeoutMs]
 * @returns {number}
 */
const getRemainingTime = (createtime, timeoutMs = ORDER_PAYMENT_TIMEOUT_MS) => {
  const createMs = new Date(createtime).getTime()
  if (isNaN(createMs)) return 0
  const elapsed = Date.now() - createMs
  return Math.max(0, timeoutMs - elapsed)
}

/**
 * 判断是否已过期
 * @param {string|number} createtime
 * @param {number} [timeoutMs]
 * @returns {boolean}
 */
const isPaymentExpired = (createtime, timeoutMs = ORDER_PAYMENT_TIMEOUT_MS) => getRemainingTime(createtime, timeoutMs) <= 0

/**
 * 格式化倒计时显示
 * @param {number} remainingMs
 * @returns {string} 格式：MM:SS 或 HH:MM:SS
 */
const formatCountdown = (remainingMs) => {
  if (remainingMs <= 0) return '00:00'
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(remainMinutes).padStart(2, '0')}:${ss}`
  }
  return `${mm}:${ss}`
}

export { getRemainingTime, isPaymentExpired, formatCountdown }
