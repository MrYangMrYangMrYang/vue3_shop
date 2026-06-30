/**
 * @module utils/mask
 * @description 敏感信息脱敏工具
 */

/**
 * 手机号脱敏：138****5678
 * @param mobile 原始手机号
 * @returns 脱敏后手机号，非标准手机号原样返回
 */
export function maskMobile(mobile: unknown): string {
  if (!mobile) return ''
  const mobileStr = String(mobile).trim()
  if (!/^1\d{10}$/.test(mobileStr)) return mobileStr
  return `${mobileStr.slice(0, 3)}****${mobileStr.slice(7)}`
}
