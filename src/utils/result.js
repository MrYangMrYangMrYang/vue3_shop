/** 提取业务状态码 */
const getResultCode = (result) => Number(result?.code)

/** 判断业务是否成功（code=1） */
const isBizSuccess = (result) => getResultCode(result) === 1

/** 判断业务是否失败（code=0） */
const isBizFail = (result) => getResultCode(result) === 0

export { getResultCode, isBizSuccess, isBizFail }
