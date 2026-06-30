/**
 * @fileoverview user store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../user'
import { POST } from '@/services/request'
import type { ApiResult } from '@/services/request'

vi.mock('@/services/request')

const mockedPOST = vi.mocked(POST)

/** 构造用户信息 */
const makeUserInfo = (overrides: Record<string, unknown> = {}) => ({
  id: 100,
  mobile: '13800138000',
  nickname: '测试用户',
  ...overrides
})

describe('user store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('无 localStorage 时初始状态为空', () => {
    const store = useUserStore()
    expect(store.userInfo).toBeNull()
    expect(store.selectedAddressId).toBeNull()
    expect(store.selectedAddress).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.isChecked).toBe(false)
  })

  describe('setUserInfo', () => {
    it('设置用户信息并持久化到 localStorage', () => {
      const store = useUserStore()
      const info = makeUserInfo()
      store.setUserInfo(info)
      expect(store.userInfo).toEqual(info)
      expect(JSON.parse(localStorage.getItem('business') || '')).toEqual(info)
      expect(store.isLoggedIn).toBe(true)
    })

    it('传入 null 清除 localStorage', () => {
      const store = useUserStore()
      store.setUserInfo(makeUserInfo())
      store.setUserInfo(null)
      expect(store.userInfo).toBeNull()
      expect(localStorage.getItem('business')).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })

    it('localStorage 损坏时 getStoredUser 返回 null 不抛错', () => {
      localStorage.setItem('business', '{invalid json}')
      const store = useUserStore()
      expect(store.userInfo).toBeNull()
    })
  })

  describe('clearUserInfo', () => {
    it('清除所有用户状态和 localStorage', () => {
      const store = useUserStore()
      store.setUserInfo(makeUserInfo())
      store.setSelectedAddressId('addr-1')
      store.setSelectedAddress({ id: 'addr-1', name: '张三', tel: '13800138000', address: '北京' })

      store.clearUserInfo()

      expect(store.userInfo).toBeNull()
      expect(store.selectedAddressId).toBeNull()
      expect(store.selectedAddress).toBeNull()
      expect(store.isChecked).toBe(false)
      expect(localStorage.getItem('business')).toBeNull()
      expect(localStorage.getItem('address_id')).toBeNull()
      expect(localStorage.getItem('selected_address')).toBeNull()
    })
  })

  describe('setSelectedAddressId', () => {
    it('设置地址 ID 并持久化', () => {
      const store = useUserStore()
      store.setSelectedAddressId('addr-100')
      expect(store.selectedAddressId).toBe('addr-100')
      expect(localStorage.getItem('address_id')).toBe('addr-100')
    })

    it('传入 null 移除 localStorage', () => {
      const store = useUserStore()
      store.setSelectedAddressId('addr-100')
      store.setSelectedAddressId(null)
      expect(store.selectedAddressId).toBeNull()
      expect(localStorage.getItem('address_id')).toBeNull()
    })
  })

  describe('setSelectedAddress', () => {
    it('设置地址对象并持久化', () => {
      const store = useUserStore()
      const addr = { id: 'addr-1', name: '张三', tel: '13800138000', address: '北京市朝阳区' }
      store.setSelectedAddress(addr)
      expect(store.selectedAddress).toEqual(addr)
      expect(JSON.parse(localStorage.getItem('selected_address') || '')).toEqual(addr)
    })

    it('传入 null 清除地址', () => {
      const store = useUserStore()
      store.setSelectedAddress({ id: '1', name: '张三', tel: '138', address: '北京' })
      store.setSelectedAddress(null)
      expect(store.selectedAddress).toBeNull()
      expect(localStorage.getItem('selected_address')).toBeNull()
    })
  })

  describe('checkLogin', () => {
    it('userInfo 为 null 时直接返回 false 不请求', async () => {
      const store = useUserStore()
      const result = await store.checkLogin()
      expect(result).toBe(false)
      expect(mockedPOST).not.toHaveBeenCalled()
    })

    it('校验成功后更新用户信息并标记 isChecked', async () => {
      const store = useUserStore()
      store.setUserInfo(makeUserInfo())
      const freshInfo = makeUserInfo({ nickname: '更新昵称' })
      mockedPOST.mockResolvedValueOnce({ code: 1, msg: 'ok', data: freshInfo } as ApiResult)

      const result = await store.checkLogin()

      expect(result).toBe(true)
      expect(store.isChecked).toBe(true)
      expect(store.userInfo?.nickname).toBe('更新昵称')
      expect(mockedPOST).toHaveBeenCalledWith({ url: '/business/check', params: { id: 100, mobile: '13800138000' } })
    })

    it('校验失败时清除用户信息', async () => {
      const store = useUserStore()
      store.setUserInfo(makeUserInfo())
      mockedPOST.mockResolvedValueOnce({ code: 0, msg: 'token 失效', data: null } as ApiResult)

      const result = await store.checkLogin()

      expect(result).toBe(false)
      expect(store.userInfo).toBeNull()
    })

    it('TTL 内复用上次校验结果不重复请求', async () => {
      const store = useUserStore()
      store.setUserInfo(makeUserInfo())
      mockedPOST.mockResolvedValueOnce({ code: 1, msg: 'ok', data: makeUserInfo() } as ApiResult)

      await store.checkLogin()
      await store.checkLogin() // 第二次应复用

      expect(mockedPOST).toHaveBeenCalledTimes(1)
    })
  })
})
