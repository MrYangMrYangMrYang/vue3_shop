/** 将 ID 数组/单个值规范化为逗号分隔字符串 */
const normalizeIdList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined && item !== '').join(',')
  }
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

/**
 * 安全获取路由参数
 * @param {Object} query
 * @param {string} key
 * @param {*} [defaultValue='']
 * @returns {*}
 */
const getRouteQueryValue = (query, key, defaultValue = '') => {
  if (!query || !Object.prototype.hasOwnProperty.call(query, key)) return defaultValue
  const value = query[key]
  if (Array.isArray(value)) return value[0] ?? defaultValue
  return value ?? defaultValue
}

export { normalizeIdList, getRouteQueryValue }
