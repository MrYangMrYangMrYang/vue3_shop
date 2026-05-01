<!-- 
  @fileoverview 编辑地址组件
  @module components/business/address/edit
  @description 负责收货地址的详情回显、修改提交及地址删除操作，
               支持默认地址设置，通过路由参数 id 获取待编辑地址
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /business/address/edit?id=123 (需要登录)
  <router-link :to="{ path: '/business/address/edit', query: { id: 123 } }">编辑地址</router-link>
-->
<template>
  <div class="address-edit-page">
    <van-nav-bar
      title="编辑收货地址"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="address-edit-container">
      <van-address-edit
        :area-list="areaList"
        :address-info="address"
        show-set-default
        show-delete
        :is-saving="saving"
        :is-deleting="deleting"
        :area-columns-placeholder="['请选择省', '请选择市', '请选择区']"
        @save="save"
        @delete="del"
        class="custom-address-edit"
      />
    </div>
  </div>
</template>

<style scoped>
.address-edit-page {
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

:deep(.van-button--danger) {
  background: var(--primary-gradient);
  border: none;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2);
}

:deep(.van-button--default) {
  height: 46px;
  font-size: 16px;
}

:deep(.van-switch--on) {
  background-color: var(--primary-color);
}
</style>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onBeforeMount } from 'vue'
import { areaList } from '@vant/area-data'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { useBack } from '@/hooks'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

var addrid = getRouteQueryValue(route.query, 'id', 0)
var business = userStore.userInfo || {}
const saving = ref(false)
const deleting = ref(false)

const address = reactive({})

const back = useBack()

/** 加载地址详情 */
const info = async () => {
  try {
    var data = { busid: business.id, id: addrid }
    var result = await POST({ url: '/address/info', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    address.name = result.data.consignee
    address.tel = result.data.mobile
    address.addressDetail = result.data.address
    address.isDefault = result.data.status == '1' ? true : false
    address.areaCode = result.data.district || result.data.city || result.data.province
  } catch (error) {
    showFailToast('地址信息加载失败，请稍后重试')
  }
}

/** 保存修改 */
const save = async (info) => {
  if (saving.value) return false
  var data = {
    id: addrid,
    busid: business.id,
    consignee: info.name,
    mobile: info.tel,
    address: info.addressDetail,
    code: info.areaCode,
    status: info.isDefault
  }

  saving.value = true
  try {
    var result = await POST({ url: '/address/edit', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    showSuccessToast({
      message: result.msg,
      onClose: () => { router.go(-1) }
    })
  } catch (error) {
    showFailToast('地址保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

/** 删除地址 */
const del = async () => {
  if (deleting.value) return
  showConfirmDialog({
    title: '删除提醒',
    message: '是否确认删除地址',
    confirmButtonColor: '#FF464E'
  }).then(async () => {
    deleting.value = true
    try {
      var result = await POST({ url: '/address/del', params: { id: addrid, busid: business.id } })
      if (!isBizFail(result)) router.go(-1)
    } catch (error) {
      showFailToast('删除失败，请稍后重试')
    } finally {
      deleting.value = false
    }
  }).catch(() => {})
}

onBeforeMount(() => { info() })
</script>