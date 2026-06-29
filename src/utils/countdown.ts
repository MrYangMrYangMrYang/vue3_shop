/**
 * @module utils/countdown
 * @description 支付倒计时工具：计算剩余时间、判断过期、格式化显示
 */

import { ORDER_PAYMENT_TIMEOUT_MS } from '@/constants/order'

type TimeInput = string | number

/**
 * 计算剩余支付时间（毫秒）
 * @param createtime 订单创建时间（undefined 视为已过期，返回 0）
 * @param timeoutMs 超时阈值，默认取常量
 */
const getRemainingTime = (
  createtime: TimeInput | null | undefined,
  timeoutMs: number = ORDER_PAYMENT_TIMEOUT_MS
): number => {
  if (createtime == null) return 0
  const createMs = new Date(createtime).getTime()
  if (isNaN(createMs)) return 0
  const elapsed = Date.now() - createMs
  return Math.max(0, timeoutMs - elapsed)
}

/**
 * 判断是否已过期
 * @param createtime 订单创建时间（undefined 视为已过期）
 * @param timeoutMs 超时阈值，默认取常量
 */
const isPaymentExpired = (
  createtime: TimeInput | null | undefined,
  timeoutMs: number = ORDER_PAYMENT_TIMEOUT_MS
): boolean => getRemainingTime(createtime, timeoutMs) <= 0

/**
 * 格式化倒计时显示
 * @param remainingMs 剩余毫秒数
 * @returns 格式：MM:SS 或 HH:MM:SS
 */
const formatCountdown = (remainingMs: number): string => {
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

export { getRemainingTime, isPaymentExpired, formatCountdown, type TimeInput }
