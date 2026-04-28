import { defineStore } from 'pinia'
import { ref } from 'vue'
import { POST } from '@/services/request'

export const useUserStore = defineStore('user', () => {
  /** 从 localStorage 读取用户信息 */
  const getStoredUser = () => {
    const stored = localStorage.getItem('business')
    try { return stored ? JSON.parse(stored) : null }
    catch (e) { return null }
  }

  const userInfo = ref(getStoredUser())
  const selectedAddressId = ref(localStorage.getItem('address_id'))
  const selectedAddress = ref(null)
  const isChecked = ref(false)

  /** 设置用户信息并持久化 */
  const setUserInfo = (data) => {
    userInfo.value = data
    if (data) localStorage.setItem('business', JSON.stringify(data))
    else localStorage.removeItem('business')
  }

  /**
   * 检查登录状态
   * @returns {Promise<boolean>}
   */
  const checkLogin = async () => {
    if (!userInfo.value) return false
    if (isChecked.value && userInfo.value) return true

    try {
      const { id, mobile } = userInfo.value
      const result = await POST({ url: '/business/check', params: { id, mobile } })
      if (result.code === 1) {
        setUserInfo(result.data)
        isChecked.value = true
        return true
      } else {
        clearUserInfo()
        return false
      }
    } catch (error) {
      return false
    }
  }

  /** 清除所有用户状态 */
  const clearUserInfo = () => {
    userInfo.value = null
    selectedAddressId.value = null
    selectedAddress.value = null
    isChecked.value = false
    localStorage.removeItem('business')
    localStorage.removeItem('address_id')
  }

  /** 设置选中地址ID并持久化 */
  const setSelectedAddressId = (id) => {
    selectedAddressId.value = id
    if (id) localStorage.setItem('address_id', id)
    else localStorage.removeItem('address_id')
  }

  /** 设置选中地址对象 */
  const setSelectedAddress = (address) => { selectedAddress.value = address || null }

  return {
    userInfo,
    selectedAddressId,
    selectedAddress,
    isChecked,
    setUserInfo,
    checkLogin,
    clearUserInfo,
    setSelectedAddressId,
    setSelectedAddress
  }
})
