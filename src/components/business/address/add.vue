<!-- 
  @fileoverview 新增地址组件
  @module components/business/address/add
  @description 负责收货地址的新增表单录入与提交，支持设置默认地址，
               使用 Vant AddressEdit 组件提供省市区选择功能
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /business/address/add (需要登录)
  <router-link to="/business/address/add">新增地址</router-link>
-->
<template>
  <div class="address-add-page">
    <van-nav-bar
      title="新增收货地址"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="address-edit-container">
      <van-address-edit
        :area-list="areaList"
        show-set-default
        :is-saving="saving"
        :area-columns-placeholder="['请选择省', '请选择市', '请选择区']"
        @save="save"
        class="custom-address-edit"
      />
    </div>
  </div>
</template>

<style scoped>
.address-add-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

.address-edit-container {
  padding: 12px;
}

:deep(.van-address-edit) {
  padding: 0;
}

:deep(.van-cell-group--inset) {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

:deep(.van-address-edit__buttons) {
  padding: 32px 16px;
}

:deep(.van-button--danger),
:deep(.van-button--primary) {
  background: var(--primary-gradient);
  border: none;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2);
}

:deep(.van-switch--on) {
  background-color: var(--primary-color);
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { areaList } from '@vant/area-data'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { isBizFail } from '@/utils/result'
import { useBack } from '@/hooks'

const userStore = useUserStore()
const router = useRouter()
var business = userStore.userInfo || {}
const saving = ref(false)

const back = useBack()

/** 保存新地址 */
const save = async (info) => {
  if (saving.value) return false
  var data = {
    busid: business.id,
    consignee: info.name,
    mobile: info.tel,
    address: info.addressDetail,
    code: info.areaCode,
    status: info.isDefault
  }

  saving.value = true
  try {
    var result = await POST({ url: '/address/add', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    showSuccessToast({
      message: result.msg,
      onClose: () => { router.go(-1) }
    })
  } catch (error) {
    showFailToast('保存地址失败，请稍后重试')
  } finally {
    saving.value = false
  }
}
</script>