import { describe, it, expect } from 'vitest'
import { processImages, isRetryableError, getRequestKey } from '../request'

const DOMAIN = 'www.fastadmin.com'
const url = (path: string) => `http://${DOMAIN}${path}`

describe('processImages', () => {
  it('剥离 image 字段的图片域名前缀', () => {
    const data = { image: url('/uploads/a.jpg') }
    expect(processImages(data)).toEqual({ image: '/uploads/a.jpg' })
  })

  it('thumb / avatar / cover 等图片字段均剥离', () => {
    const data = {
      thumb: url('/t.png'),
      avatar: url('/u.jpeg'),
      cover: url('/c.gif')
    }
    expect(processImages(data)).toEqual({
      thumb: '/t.png',
      avatar: '/u.jpeg',
      cover: '/c.gif'
    })
  })

  it('key 含 image/img/icon 子串时识别为图片字段并剥离', () => {
    const data = {
      product_image: url('/p.jpg'),
      thumb_img: url('/t.jpg'),
      list_icon: url('/i.png')
    }
    expect(processImages(data)).toEqual({
      product_image: '/p.jpg',
      thumb_img: '/t.jpg',
      list_icon: '/i.png'
    })
  })

  it('递归处理数组中的图片字段', () => {
    const data = [{ image: url('/1.jpg') }, { image: url('/2.jpg') }]
    expect(processImages(data)).toEqual([{ image: '/1.jpg' }, { image: '/2.jpg' }])
  })

  it('递归处理嵌套对象的图片字段', () => {
    const data = { product: { info: { image: url('/nested.jpg') } } }
    expect(processImages(data)).toEqual({ product: { info: { image: '/nested.jpg' } } })
  })

  it('非图片字段含域名但非图片扩展名时不剥离', () => {
    const data = { name: url('/some-page') }
    expect(processImages(data)).toEqual({ name: url('/some-page') })
  })

  it('非图片字段含域名且为图片扩展名时剥离', () => {
    const data = { custom_field: url('/x.jpg') }
    expect(processImages(data)).toEqual({ custom_field: '/x.jpg' })
  })

  it('图片字段不含域名时不处理', () => {
    const data = { image: '/already/relative.jpg' }
    expect(processImages(data)).toEqual({ image: '/already/relative.jpg' })
  })

  it('字符串原样返回（非对象/数组）', () => {
    expect(processImages('hello')).toBe('hello')
    expect(processImages(url('/a.jpg'))).toBe(url('/a.jpg'))
  })

  it('number / null / undefined 原样返回', () => {
    expect(processImages(42)).toBe(42)
    expect(processImages(null)).toBeNull()
    expect(processImages(undefined)).toBeUndefined()
  })

  it('空数组与空对象原样返回', () => {
    expect(processImages([])).toEqual([])
    expect(processImages({})).toEqual({})
  })
})

describe('isRetryableError', () => {
  it('ECONNABORTED（超时）可重试', () => {
    expect(isRetryableError({ code: 'ECONNABORTED', message: 'timeout' })).toBe(true)
  })

  it('Network Error 可重试', () => {
    expect(isRetryableError({ message: 'Network Error' })).toBe(true)
  })

  it('服务器 5xx 错误不可重试', () => {
    expect(isRetryableError({ response: { status: 500 }, message: 'server error' })).toBe(false)
  })

  it('普通错误不可重试', () => {
    expect(isRetryableError({ message: 'timeout of 10000ms exceeded' })).toBe(false)
  })

  it('null / undefined 不可重试', () => {
    expect(isRetryableError(null)).toBe(false)
    expect(isRetryableError(undefined)).toBe(false)
  })
})

describe('getRequestKey', () => {
  it('GET 请求生成完整 key 用于去重', () => {
    const key = getRequestKey({ method: 'get', url: '/product/list', params: { page: 1 } })
    expect(key).toContain('/product/list')
    expect(key).toContain('page')
  })

  it('同 url + 同 params + 同 data 的 GET 产生相同 key（去重命中）', () => {
    const a = getRequestKey({ method: 'get', url: '/x', params: { p: 1 }, data: { d: 1 } })
    const b = getRequestKey({ method: 'get', url: '/x', params: { p: 1 }, data: { d: 1 } })
    expect(a).toBe(b)
  })

  // 回归：POST /cart/index 被去重互相取消，曾导致徽标有数字、列表为空
  it('POST 返回 null（不去重），防止业务请求被 abort 吞掉', () => {
    const a = getRequestKey({ method: 'post', url: '/cart/index', params: { busid: 1 } })
    const b = getRequestKey({ method: 'post', url: '/cart/index', params: { busid: 1 } })
    expect(a).toBeNull()
    expect(b).toBeNull()
  })

  it('PUT / DELETE 同样返回 null（写操作均不去重）', () => {
    expect(getRequestKey({ method: 'put', url: '/x', params: {} })).toBeNull()
    expect(getRequestKey({ method: 'delete', url: '/x', params: {} })).toBeNull()
  })

  it('未指定 method 时按 GET 参与去重', () => {
    const key = getRequestKey({ url: '/x', params: { a: 1 } })
    expect(key).toContain('/x')
    expect(key!.length).toBeGreaterThan(0)
  })
})
