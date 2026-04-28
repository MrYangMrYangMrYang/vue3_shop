import axios from 'axios'
import { showFailToast } from 'vant'

/** 请求取消控制器映射表 */
const pendingMap = new Map()

/** 移除并取消待处理请求 */
function removePending(config) {
  const url = [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
  if (pendingMap.has(url)) { pendingMap.get(url).abort(); pendingMap.delete(url) }
}

/** 添加请求到待处理列表 */
function addPending(config) {
  const url = [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
  const controller = new AbortController()
  config.signal = controller.signal
  if (!pendingMap.has(url)) pendingMap.set(url, controller)
}

/** 请求拦截器 */
axios.interceptors.request.use(config => { addPending(config); return config }, error => Promise.reject(error))

/** 图片字段名集合（用于自动路径转换） */
const IMAGE_FIELDS = new Set(['image', 'images', 'avatar', 'thumb', 'icon', 'logo', 'pic', 'photo', 'cover', 'img'])

/** 递归转换图片路径 */
function processImages(data) {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) return data.map(item => processImages(item))
  const processedData = { ...data }
  Object.keys(processedData).forEach(key => {
    const value = processedData[key]
    if (typeof value === 'string') {
      const isImageField = IMAGE_FIELDS.has(key) || key.includes('image') || key.includes('img') || key.includes('icon')
      const hasDomain = value.includes('www.fastadmin.com')
      if ((isImageField || (hasDomain && /\.(jpg|png|gif|jpeg)$/i.test(value))) && hasDomain) {
        processedData[key] = value.replace(/http:\/\/www\.fastadmin\.com/g, '')
      }
    } else if (value && typeof value === 'object') {
      processedData[key] = processImages(value)
    }
  })
  return processedData
}

/** 响应拦截器：统一数据处理和错误提示 */
axios.interceptors.response.use(
  response => {
    removePending(response.config)
    let resData = response.data
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && resData?.data) {
      resData.data = processImages(resData.data)
    }
    return resData
  },
  err => {
    if (err.config) removePending(err.config)
    if (axios.isCancel(err)) return Promise.reject(err)

    if (err?.response) {
      const statusMessages = { 400: '错误请求', 401: '未授权，请重新登录', 403: '拒绝访问', 404: '请求错误,未找到该资源', 405: '请求方法未允许', 408: '请求超时', 500: '服务器端出错', 501: '网络未实现', 502: '网络错误', 503: '服务不可用', 504: '网络超时', 505: 'http版本不支持该请求' }
      err.message = statusMessages[err.response.status] || `连接错误${err.response.status}`
    } else {
      err.message = err.message === 'canceled' ? '操作已取消' : '连接到服务器失败'
    }

    showFailToast({ message: err.message, duration: 2000 })
    return Promise.reject(err)
  }
)

// 基础配置
axios.defaults.baseURL = '/shop'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.timeout = 10000

/** GET 请求 */
let GET = (data = {}) => axios.get(data.url, { params: data.params })

/** POST 请求 */
let POST = (data = {}) => axios.post(data.url, data.params)

/**
 * 文件上传
 * @param {Object} data
 * @param {string} data.url
 * @param {Object} data.params
 */
let UPLOAD = (data = {}) => {
  const formData = new FormData()
  if (data.params) Object.keys(data.params).forEach(key => formData.append(key, data.params[key]))
  return axios.post(data.url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export { GET, POST, UPLOAD }
