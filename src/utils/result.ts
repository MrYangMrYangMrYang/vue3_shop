/**
 * @module utils/result
 * @description 业务返回值状态码工具，统一处理后端 code 字段的判断逻辑
 */

interface BizResult {
  code?: number | string
  [key: string]: any
}

/** 提取业务状态码 */
const getResultCode = (result?: BizResult | null): number => Number(result?.code)

/** 判断业务是否成功（code=1） */
const isBizSuccess = (result?: BizResult | null): boolean => getResultCode(result) === 1

/** 判断业务是否失败（code=0） */
const isBizFail = (result?: BizResult | null): boolean => getResultCode(result) === 0

export { getResultCode, isBizSuccess, isBizFail, type BizResult }
