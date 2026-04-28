/** 安全转换为数字，无效值返回 0 */
const toNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

/** 四舍五入保留两位小数 */
const roundToTwo = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100

/** 元转分（整数） */
const toFen = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100)

/**
 * 格式化金额
 * @param {number} value
 * @param {number} [fractionDigits=2]
 * @returns {string}
 */
const formatCurrency = (value, fractionDigits = 2) => roundToTwo(value).toFixed(fractionDigits)

export { toNumber, roundToTwo, toFen, formatCurrency }
