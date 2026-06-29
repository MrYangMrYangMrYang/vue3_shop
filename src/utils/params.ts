/**
 * @module utils/params
 * @description 路由参数与 ID 列表的规范化工具
 */

type IdInput = string | number | (string | number | null | undefined)[] | null | undefined

/** 将 ID 数组/单个值规范化为逗号分隔字符串 */
const normalizeIdList = (value: IdInput): string => {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined && item !== '').join(',')
  }
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

interface RouteQueryLike {
  [key: string]: unknown
}

/**
 * 安全获取路由参数
 * @param query 路由 query 对象
 * @param key 取值的键
 * @param defaultValue 缺省值（默认空字符串）
 */
const getRouteQueryValue = <T = string>(
  query: RouteQueryLike | null | undefined,
  key: string,
  defaultValue: T = '' as T
): T => {
  if (!query || !Object.prototype.hasOwnProperty.call(query, key)) return defaultValue
  const value = query[key]
  if (Array.isArray(value)) return (value[0] ?? defaultValue) as T
  return (value ?? defaultValue) as T
}

export { normalizeIdList, getRouteQueryValue, type IdInput, type RouteQueryLike }
