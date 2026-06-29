/**
 * @module utils/currency
 * @description 金额计算与格式化工具
 */

/** 安全转换为数字，无效值返回 0 */
const toNumber = (value: unknown): number => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

/** 四舍五入保留两位小数 */
const roundToTwo = (value: unknown): number => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100

/** 元转分（整数） */
const toFen = (value: unknown): number => Math.round((toNumber(value) + Number.EPSILON) * 100)

/**
 * 格式化金额
 * @param value 金额数值
 * @param fractionDigits 小数位数，默认 2
 */
const formatCurrency = (value: unknown, fractionDigits: number = 2): string => roundToTwo(value).toFixed(fractionDigits)

export { toNumber, roundToTwo, toFen, formatCurrency }
