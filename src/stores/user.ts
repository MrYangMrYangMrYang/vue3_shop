/**
 * @module stores/user
 * @description 当前登录用户状态：登录校验、信息持久化、选中地址管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { POST } from '@/services/request'
import { useCartStore } from '@/stores/cart'

/** 登录校验 TTL：10 分钟内复用上次校验结果，避免频繁请求 */
const CHECK_TTL = 10 * 60 * 1000

/** 当前登录用户信息（业务字段，来源于后端 /business/check 响应） */
interface BusinessUserInfo {
  id?: number
  mobile?: string
  nickname?: string
  avatar?: string
  email?: string
  region_code?: string
  token?: string
  auth?: string
  /** 头像首字（如「张」）用于无头像时文字占位 */
  avatar_text?: string
}

/** 收货地址完整结构（业务侧字段，由 setSelectedAddress 在调用处从后端字段映射） */
interface AddressInfo {
  id: string | number
  name: string
  /** 收货人手机号（业务侧约定为 tel；调用处从后端 mobile 映射） */
  tel: string
  address: string
}

export const useUserStore = defineStore('user', () => {
  /** 从 localStorage 读取用户信息 */
  const getStoredUser = (): BusinessUserInfo | null => {
    const stored = localStorage.getItem('business')
    try {
      return stored ? (JSON.parse(stored) as BusinessUserInfo) : null
    } catch (e) {
      return null
    }
  }

  const userInfo = ref<BusinessUserInfo | null>(getStoredUser())
  /** 从 localStorage 恢复选中地址 */
  const getStoredAddress = (): AddressInfo | null => {
    try {
      const raw = localStorage.getItem('selected_address')
      return raw ? (JSON.parse(raw) as AddressInfo) : null
    } catch {
      return null
    }
  }

  const selectedAddressId = ref<string | null>(localStorage.getItem('address_id'))
  const selectedAddress = ref<AddressInfo | null>(getStoredAddress())
  const isChecked = ref<boolean>(false)
  const lastCheckTime = ref<number>(0)

  /** 是否已登录（派生状态，替代业务侧散落的 !!userInfo 判断） */
  const isLoggedIn = computed(() => !!userInfo.value)

  /** 设置用户信息并持久化 */
  const setUserInfo = (data: BusinessUserInfo | null): void => {
    userInfo.value = data
    if (data) localStorage.setItem('business', JSON.stringify(data))
    else localStorage.removeItem('business')
  }

  /**
   * 检查登录状态（TTL 内复用上次校验结果）
   */
  const checkLogin = async (): Promise<boolean> => {
    const info = userInfo.value
    if (!info) return false
    if (isChecked.value && Date.now() - lastCheckTime.value < CHECK_TTL) return true

    try {
      const { id, mobile } = info
      const result = await POST({ url: '/business/check', params: { id, mobile } })
      if (result.code === 1) {
        setUserInfo(result.data as BusinessUserInfo)
        isChecked.value = true
        lastCheckTime.value = Date.now()
        return true
      } else {
        clearUserInfo()
        return false
      }
    } catch (error) {
      return false
    }
  }

  /** 清除所有用户状态（同时清空购物车角标，避免切号残留） */
  const clearUserInfo = (): void => {
    userInfo.value = null
    selectedAddressId.value = null
    selectedAddress.value = null
    isChecked.value = false
    lastCheckTime.value = 0
    localStorage.removeItem('business')
    localStorage.removeItem('address_id')
    localStorage.removeItem('selected_address')
    useCartStore().clear()
  }

  /** 设置选中地址ID并持久化 */
  const setSelectedAddressId = (id: string | null): void => {
    selectedAddressId.value = id
    if (id) localStorage.setItem('address_id', id)
    else localStorage.removeItem('address_id')
  }

  /** 设置选中地址对象 */
  const setSelectedAddress = (address: AddressInfo | null): void => {
    selectedAddress.value = address || null
    if (address) localStorage.setItem('selected_address', JSON.stringify(address))
    else localStorage.removeItem('selected_address')
  }

  return {
    userInfo,
    selectedAddressId,
    selectedAddress,
    isChecked,
    isLoggedIn,
    setUserInfo,
    checkLogin,
    clearUserInfo,
    setSelectedAddressId,
    setSelectedAddress
  }
})
