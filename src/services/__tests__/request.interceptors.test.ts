import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/* ---------- mock 依赖（vi.hoisted 确保 mock 变量在 vi.mock 工厂执行前可用） ---------- */

const mocks = vi.hoisted(() => ({
  showFailToast: vi.fn(),
  clearUserInfo: vi.fn(),
  routerReplace: vi.fn()
}))

vi.mock('vant', () => ({
  showFailToast: mocks.showFailToast
}))

// handleUnauthorized 内部动态导入 user store 与 router，预先 mock 避免真实依赖
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ clearUserInfo: mocks.clearUserInfo })
}))

vi.mock('@/router', () => ({
  default: {
    currentRoute: { value: { path: '/home', fullPath: '/home' } },
    replace: mocks.routerReplace
  }
}))

import service, { GET, POST, UPLOAD } from '../request'

/* ---------- 提取拦截器处理函数 ---------- */

// axios v1 将拦截器存放在 interceptors.request.handlers 数组中
const requestHandlers = (
  service.interceptors.request as unknown as {
    handlers: Array<{
      fulfilled: (c: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
      rejected: (e: unknown) => unknown
    }>
  }
).handlers
const responseHandlers = (
  service.interceptors.response as unknown as {
    handlers: Array<{
      fulfilled: (r: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
      rejected: (e: unknown) => unknown
    }>
  }
).handlers

const requestFulfilled = requestHandlers[0]!.fulfilled
const responseRejected = responseHandlers[0]!.rejected

describe('请求拦截器', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('localStorage 有 token 时注入 Authorization 头', () => {
    localStorage.setItem('business', JSON.stringify({ token: 'test-token-123' }))
    const config: AxiosRequestConfig = { method: 'get', url: '/test', headers: {} }
    const result = requestFulfilled(config) as AxiosRequestConfig
    expect(result.headers?.Authorization).toBe('Bearer test-token-123')
  })

  it('localStorage 无 token 时不注入 Authorization 头', () => {
    const config: AxiosRequestConfig = { method: 'get', url: '/test', headers: {} }
    const result = requestFulfilled(config) as AxiosRequestConfig
    expect(result.headers?.Authorization).toBeUndefined()
  })

  it('localStorage 数据损坏时降级为空 token（不报错）', () => {
    localStorage.setItem('business', 'not-json')
    const config: AxiosRequestConfig = { method: 'get', url: '/test', headers: {} }
    expect(() => requestFulfilled(config)).not.toThrow()
    const result = requestFulfilled(config) as AxiosRequestConfig
    expect(result.headers?.Authorization).toBeUndefined()
  })

  it('GET 请求被加入 pendingMap（config.signal 被设置）', () => {
    const config: AxiosRequestConfig = { method: 'get', url: '/unique-pending-test', headers: {} }
    const result = requestFulfilled(config) as AxiosRequestConfig
    expect(result.signal).toBeDefined()
  })

  it('POST 请求不参与去重（config.signal 不被覆盖）', () => {
    const originalSignal = new AbortController().signal
    const config: AxiosRequestConfig = { method: 'post', url: '/post-test', headers: {}, signal: originalSignal }
    const result = requestFulfilled(config) as AxiosRequestConfig
    expect(result.signal).toBe(originalSignal)
  })
})

describe('响应错误拦截器', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('401 错误触发自动登出并跳转登录页', async () => {
    const error = {
      config: { method: 'get', url: '/test' },
      response: { status: 401 },
      message: 'Unauthorized'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.clearUserInfo).toHaveBeenCalled()
    expect(mocks.routerReplace).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/home' }
    })
    // 401 不应弹 Toast
    expect(mocks.showFailToast).not.toHaveBeenCalled()
  })

  it('401 且已在登录页时不重复跳转', async () => {
    // 临时修改 mock 路由的当前路径
    const routersModule = await import('@/router')
    const router = (routersModule as { default: { currentRoute: { value: { path: string } } } }).default
    const originalPath = router.currentRoute.value.path
    router.currentRoute.value.path = '/login'

    const error = {
      config: { method: 'get', url: '/test' },
      response: { status: 401 },
      message: 'Unauthorized'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.routerReplace).not.toHaveBeenCalled()

    router.currentRoute.value.path = originalPath
  })

  it('可重试错误（Network Error）自动重试', async () => {
    vi.useFakeTimers()
    const requestSpy = vi.spyOn(service, 'request').mockResolvedValue({ data: { code: 1, msg: 'ok', data: '' } })

    const error = {
      config: { method: 'get', url: '/retry-test', headers: {} },
      message: 'Network Error'
    }

    const promise = responseRejected(error)
    await vi.advanceTimersByTimeAsync(500)
    await promise

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(requestSpy.mock.calls[0][0]).toHaveProperty('__retryCount', 1)

    requestSpy.mockRestore()
    vi.useRealTimers()
  })

  it('达到最大重试次数后不再重试，显示错误提示', async () => {
    const error = {
      config: { method: 'get', url: '/test', __retryCount: 2 },
      message: 'Network Error'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).toHaveBeenCalledWith(expect.objectContaining({ message: '连接到服务器失败' }))
  })

  it('404 错误显示对应状态码消息', async () => {
    const error = {
      config: { method: 'get', url: '/test' },
      response: { status: 404 },
      message: 'Not Found'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).toHaveBeenCalledWith(expect.objectContaining({ message: '请求错误,未找到该资源' }))
  })

  it('500 错误显示服务器出错消息', async () => {
    const error = {
      config: { method: 'get', url: '/test' },
      response: { status: 500 },
      message: 'Internal Server Error'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).toHaveBeenCalledWith(expect.objectContaining({ message: '服务器端出错' }))
  })

  it('未知状态码显示"连接错误{status}"', async () => {
    const error = {
      config: { method: 'get', url: '/test' },
      response: { status: 418 },
      message: "I'm a teapot"
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).toHaveBeenCalledWith(expect.objectContaining({ message: '连接错误418' }))
  })

  it('silent 选项关闭全局 Toast', async () => {
    const error = {
      config: { method: 'get', url: '/test', silent: true },
      response: { status: 500 },
      message: 'Server Error'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).not.toHaveBeenCalled()
  })

  it('无 response 的网络错误显示"连接到服务器失败"', async () => {
    const error = {
      config: { method: 'get', url: '/test', __retryCount: 2 },
      message: 'Network Error'
    }
    await expect(responseRejected(error)).rejects.toBe(error)
    expect(mocks.showFailToast).toHaveBeenCalledWith(expect.objectContaining({ message: '连接到服务器失败' }))
  })

  it('canceled 请求直接 reject 不显示 Toast', async () => {
    const cancelError = { __CANCEL__: true, message: 'canceled' }
    await expect(responseRejected(cancelError)).rejects.toBe(cancelError)
    expect(mocks.showFailToast).not.toHaveBeenCalled()
  })
})

describe('GET / POST / UPLOAD 请求方法', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('GET 调用 service.get 并返回 res.data', async () => {
    const mockResponse = { data: { code: 1, data: 'result', msg: 'ok' } }
    const getSpy = vi.spyOn(service, 'get').mockResolvedValueOnce(mockResponse as never)

    const result = await GET({ url: '/product/list', params: { page: 1 } })

    expect(result).toEqual({ code: 1, data: 'result', msg: 'ok' })
    expect(getSpy).toHaveBeenCalledWith(
      '/product/list',
      expect.objectContaining({
        params: { page: 1 }
      })
    )
    getSpy.mockRestore()
  })

  it('POST 调用 service.post 并返回 res.data', async () => {
    const mockResponse = { data: { code: 1, data: 'ok', msg: 'success' } }
    const postSpy = vi.spyOn(service, 'post').mockResolvedValueOnce(mockResponse as never)

    const result = await POST({ url: '/cart/add', params: { busid: 1, proid: 2 } })

    expect(result).toEqual({ code: 1, data: 'ok', msg: 'success' })
    expect(postSpy).toHaveBeenCalledWith(
      '/cart/add',
      { busid: 1, proid: 2 },
      expect.objectContaining({
        silent: undefined
      })
    )
    postSpy.mockRestore()
  })

  it('UPLOAD 构建 FormData 并以 multipart 方式上传', async () => {
    const mockResponse = { data: { code: 1, data: 'uploaded', msg: 'ok' } }
    const postSpy = vi.spyOn(service, 'post').mockResolvedValueOnce(mockResponse as never)

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const result = await UPLOAD({ url: '/upload', params: { file, name: '测试图片' } })

    expect(result).toEqual({ code: 1, data: 'uploaded', msg: 'ok' })
    expect(postSpy).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      expect.objectContaining({
        silent: undefined,
        signal: undefined
      })
    )

    // 验证 FormData 内容
    const formData = postSpy.mock.calls[0][1] as FormData
    expect(formData.get('name')).toBe('测试图片')
    expect(formData.get('file')).toBeInstanceOf(File)
    postSpy.mockRestore()
  })

  it('UPLOAD 支持 FileList 多文件追加', async () => {
    const mockResponse = { data: { code: 1, data: 'ok', msg: '' } }
    const postSpy = vi.spyOn(service, 'post').mockResolvedValueOnce(mockResponse as never)

    // 模拟 FileList（happy-dom 无法直接 new FileList，通过设置原型链通过 instanceof 检查）
    const file1 = new File(['a'], '1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['b'], '2.jpg', { type: 'image/jpeg' })
    const fileListLike = {
      length: 2,
      0: file1,
      1: file2,
      item: (i: number) => (i === 0 ? file1 : i === 1 ? file2 : null)
    }
    Object.setPrototypeOf(fileListLike, FileList.prototype)
    const fileList = fileListLike as unknown as FileList

    await UPLOAD({ url: '/upload', params: { files: fileList } })

    const formData = postSpy.mock.calls[0][1] as FormData
    expect(formData.getAll('files')).toHaveLength(2)
    postSpy.mockRestore()
  })

  it('UPLOAD 跳过 undefined / null 字段', async () => {
    const mockResponse = { data: { code: 1, data: 'ok', msg: '' } }
    const postSpy = vi.spyOn(service, 'post').mockResolvedValueOnce(mockResponse as never)

    await UPLOAD({ url: '/upload', params: { a: 'value', b: undefined, c: null } })

    const formData = postSpy.mock.calls[0][1] as FormData
    expect(formData.get('a')).toBe('value')
    expect(formData.has('b')).toBe(false)
    expect(formData.has('c')).toBe(false)
    postSpy.mockRestore()
  })
})
