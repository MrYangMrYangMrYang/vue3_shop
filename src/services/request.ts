/**
 * @fileoverview HTTP 请求封装
 * @module services/request
 * @description 基于 axios.create 的独立请求实例，统一封装：
 *   1. 请求去重（AbortController 自动取消重复请求）
 *   2. Token 鉴权（条件式注入 Authorization 头，兼容 busid 鉴权模型）
 *   3. 401 自动登出（清除用户态并跳转登录页，携带 redirect）
 *   4. 网络错误/超时自动重试（仅重试未到达服务器的请求，避免重复提交）
 *   5. silent 选项（业务层可关闭全局 Toast，用于轮询/预取场景）
 *   6. 图片域名转换（响应数据中图片路径自动剥离域名）
 *   7. 文件上传支持多文件/数组字段
 * @requires axios
 * @requires vant
 * @example
 * // 普通请求
 * const result = await POST({ url: '/cart/add', params: { busid, proid } })
 * // 静默请求（不弹 Toast）
 * const result = await GET({ url: '/index/info', params: { proid }, silent: true })
 */

import axios, { type AxiosRequestConfig } from 'axios'
import { showFailToast } from 'vant'

/** 后端业务返回值结构（响应拦截器已剥离 AxiosResponse 外壳） */
interface ApiResult {
  code: number
  data?: any
  msg?: string
  [key: string]: any
}

/** GET/POST/UPLOAD 的统一入参 */
interface RequestOptions {
  url: string
  params?: any
  silent?: boolean
}

/** 扩展 axios 配置，支持 silent 静默与 __retryCount 重试计数 */
declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean
    __retryCount?: number
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/shop'
const IMAGE_DOMAIN = import.meta.env.VITE_IMAGE_DOMAIN || 'www.fastadmin.com'
const TIMEOUT = 10000
/** 网络错误/超时最大重试次数 */
const MAX_RETRY = 2

/* ========== 1. 独立 axios 实例（不污染全局 axios） ========== */
const service = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

/* ========== 2. 请求去重（AbortController） ========== */
const pendingMap = new Map<string, AbortController>()

/** 生成请求唯一标识（仅 GET 参与去重：POST/PUT/DELETE 是有副作用的写操作，去重会丢业务请求 */
export function getRequestKey(config: AxiosRequestConfig): string | null {
  if ((config.method || 'get').toLowerCase() !== 'get') return null
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
}

/** 移除并取消待处理请求（key 为 null 时直接跳过，对应非 GET 的写操作） */
function removePending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  if (key !== null && pendingMap.has(key)) {
    pendingMap.get(key)!.abort()
    pendingMap.delete(key)
  }
}

/** 添加请求到待处理列表（key 为 null 时直接跳过，对应非 GET 的写操作） */
function addPending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  if (key !== null && !pendingMap.has(key)) {
    const controller = new AbortController()
    config.signal = controller.signal
    pendingMap.set(key, controller)
  }
}

/* ========== 3. Token 鉴权（条件式注入，兼容 busid 鉴权） ========== */
/**
 * 从持久化的用户信息中读取 Token
 * 当前后端使用 busid+mobile 鉴权，若未来切换为 Token 模式，
 * 只要登录后将 token 存入用户信息即可自动注入
 */
function getAuthToken(): string {
  try {
    const business = JSON.parse(localStorage.getItem('business') || 'null')
    return business?.token || ''
  } catch {
    return ''
  }
}

/* ========== 4. 401 自动登出（动态导入避免循环依赖） ========== */
/**
 * 处理 401 未授权：清除用户状态并跳转登录页
 * 动态导入 user store 与 router，规避 request ↔ store ↔ router 的循环依赖
 */
async function handleUnauthorized(): Promise<void> {
  const [{ useUserStore }, { default: router }] = await Promise.all([import('@/stores/user'), import('@/routers')])
  useUserStore().clearUserInfo()
  const current = router.currentRoute.value
  if (current.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
}

/* ========== 5. 图片路径转换 ========== */
const IMAGE_FIELDS = new Set(['image', 'images', 'avatar', 'thumb', 'icon', 'logo', 'pic', 'photo', 'cover', 'img'])

/** 递归转换图片路径：剥离响应数据中的图片域名前缀 */
function processImages(data: any): any {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) return data.map(item => processImages(item))
  const processedData = { ...data }
  Object.keys(processedData).forEach(key => {
    const value = processedData[key]
    if (typeof value === 'string') {
      const isImageField = IMAGE_FIELDS.has(key) || key.includes('image') || key.includes('img') || key.includes('icon')
      const hasDomain = value.includes(IMAGE_DOMAIN)
      if ((isImageField || (hasDomain && /\.(jpg|png|gif|jpeg)$/i.test(value))) && hasDomain) {
        processedData[key] = value.replace(new RegExp('http://' + IMAGE_DOMAIN.replace(/\./g, '\\.'), 'g'), '')
      }
    } else if (value && typeof value === 'object') {
      processedData[key] = processImages(value)
    }
  })
  return processedData
}

/* ========== 6. 请求拦截器 ========== */
service.interceptors.request.use(
  config => {
    removePending(config)
    addPending(config)
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

/* ========== 7. 响应拦截器（401 / 重试 / silent） ========== */
const statusMessages: Record<number, string> = {
  400: '错误请求',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求错误,未找到该资源',
  405: '请求方法未允许',
  408: '请求超时',
  500: '服务器端出错',
  501: '网络未实现',
  502: '网络错误',
  503: '服务不可用',
  504: '网络超时',
  505: 'http版本不支持该请求'
}

/**
 * 判断是否可重试
 * 仅重试"请求未到达服务器"的网络错误与超时，
 * 不重试 5xx（服务器已处理请求，重复提交有副作用风险）
 */
function isRetryableError(error: any): boolean {
  if (!error) return false
  return error.code === 'ECONNABORTED' || error.message === 'Network Error'
}

service.interceptors.response.use(
  (response): any => {
    removePending(response.config)
    const resData = response.data as ApiResult
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && resData?.data) {
      resData.data = processImages(resData.data)
    }
    return resData
  },
  async (err: any) => {
    if (err.config) removePending(err.config)
    if (axios.isCancel(err)) return Promise.reject(err)

    const status = err?.response?.status

    // 401 自动登出
    if (status === 401) {
      await handleUnauthorized()
      return Promise.reject(err)
    }

    // 网络错误/超时自动重试
    const retryCount = err.config?.__retryCount || 0
    if (retryCount < MAX_RETRY && isRetryableError(err)) {
      err.config.__retryCount = retryCount + 1
      await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
      return service.request(err.config)
    }

    // 错误提示
    if (err?.response) {
      err.message = statusMessages[status] || `连接错误${status}`
    } else {
      err.message = err.message === 'canceled' ? '操作已取消' : '连接到服务器失败'
    }

    // silent 选项：业务层可关闭全局 Toast
    if (!err.config?.silent) {
      showFailToast({ message: err.message, duration: 2000 })
    }
    return Promise.reject(err)
  }
)

/* ========== 8. 请求方法 ========== */
/**
 * GET 请求
 * @param data 请求配置
 * @param data.url 接口路径
 * @param data.params 查询参数
 * @param data.silent 是否关闭全局错误提示
 */
const GET = (data: RequestOptions): Promise<ApiResult> =>
  service.get(data.url, { params: data.params, silent: data.silent }) as unknown as Promise<ApiResult>

/**
 * POST 请求
 * @param data 请求配置
 * @param data.url 接口路径
 * @param data.params 请求体
 * @param data.silent 是否关闭全局错误提示
 */
const POST = (data: RequestOptions): Promise<ApiResult> =>
  service.post(data.url, data.params, { silent: data.silent }) as unknown as Promise<ApiResult>

/**
 * 文件上传（支持多文件/数组字段）
 * @param data 请求配置
 * @param data.url 接口路径
 * @param data.params 表单字段，值支持单值/数组/FileList
 * @param data.silent 是否关闭全局错误提示
 */
const UPLOAD = (data: RequestOptions): Promise<ApiResult> => {
  const formData = new FormData()
  if (data.params) {
    Object.keys(data.params).forEach(key => {
      const value = data.params[key]
      if (value instanceof FileList) {
        Array.from(value).forEach(file => formData.append(key, file))
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item))
      } else if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
  }
  return service.post(data.url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    silent: data.silent
  }) as unknown as Promise<ApiResult>
}

/** 判断错误是否为请求被取消（供业务层 catch 使用，避免直接依赖全局 axios） */
const isCancel = axios.isCancel

export { GET, POST, UPLOAD, isCancel, processImages, isRetryableError, type ApiResult, type RequestOptions }
export default service
