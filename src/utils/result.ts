/**
 * @module utils/result
 * @description 业务返回值状态码工具，统一处理后端 code 字段的判断逻辑
 */

interface BizResult {
  code?: number | string
  msg?: string
  data?: unknown
  [key: string]: unknown
}

/** 提取业务状态码，缺失时返回 -1（既非成功也非失败，由调用方决定处理策略） */
const getResultCode = (result?: BizResult | null): number => {
  const code = result?.code
  if (code === undefined || code === null) return -1
  return Number(code)
}

/** 判断业务是否成功（code=1） */
const isBizSuccess = (result?: BizResult | null): boolean => getResultCode(result) === 1

/** 判断业务是否失败（code=0） */
const isBizFail = (result?: BizResult | null): boolean => getResultCode(result) === 0

export { getResultCode, isBizSuccess, isBizFail, type BizResult }
