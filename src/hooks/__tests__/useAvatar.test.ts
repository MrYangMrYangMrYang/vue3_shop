/**
 * @fileoverview useAvatar hook 单元测试
 */
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAvatar, getDisplayAvatarUrl, BACKEND_DEFAULT_AVATAR, DEFAULT_AVATAR } from '../useAvatar'

describe('getDisplayAvatarUrl', () => {
  it('undefined 返回前端默认头像', () => {
    expect(getDisplayAvatarUrl(undefined)).toBe(DEFAULT_AVATAR)
  })

  it('空字符串返回前端默认头像', () => {
    expect(getDisplayAvatarUrl('')).toBe(DEFAULT_AVATAR)
  })

  it('后端默认头像路径返回前端默认头像', () => {
    expect(getDisplayAvatarUrl(BACKEND_DEFAULT_AVATAR)).toBe(DEFAULT_AVATAR)
  })

  it('带域名的后端默认头像 URL 返回前端默认头像', () => {
    const url = `http://www.fastadmin.com${BACKEND_DEFAULT_AVATAR}`
    expect(getDisplayAvatarUrl(url)).toBe(DEFAULT_AVATAR)
  })

  it('用户自定义头像原样返回', () => {
    const url = '/uploads/avatar/123.png'
    expect(getDisplayAvatarUrl(url)).toBe(url)
  })
})

describe('useAvatar', () => {
  it('displayAvatar 为响应式 computed，跟随源数据变化', () => {
    const url = ref<string | undefined>('/uploads/me.png')
    const { displayAvatar } = useAvatar(() => url.value)

    expect(displayAvatar.value).toBe('/uploads/me.png')

    url.value = BACKEND_DEFAULT_AVATAR
    expect(displayAvatar.value).toBe(DEFAULT_AVATAR)

    url.value = undefined
    expect(displayAvatar.value).toBe(DEFAULT_AVATAR)
  })

  it('handleAvatarError 将 img.src 重置为默认头像', () => {
    const { handleAvatarError } = useAvatar(() => '/broken.png')
    const img = { src: '/broken.png' } as unknown as HTMLImageElement
    const event = { target: img } as unknown as Event

    handleAvatarError(event)
    expect(img.src).toBe(DEFAULT_AVATAR)
  })
})
