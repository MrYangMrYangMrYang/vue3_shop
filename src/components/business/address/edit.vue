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
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount} from 'vue'
  import { areaList } from '@vant/area-data'
  import { useCookies } from "vue3-cookies";
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'

  const {cookies} = useCookies()
  const router = useRouter()
  const route = useRoute()

  var addrid = route.query.hasOwnProperty('id') ? route.query.id : 0;
  var business = cookies.get('business') ? cookies.get('business') : {};

  const address = reactive({})

  const back = () => {
    router.go(-1)
  }

  const info = async () => {
    var data = { busid: business.id, id: addrid }
    var result = await POST({ url: '/address/info', params: data })

    if(result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    address.name = result.data.consignee
    address.tel = result.data.mobile
    address.addressDetail = result.data.address
    address.isDefault = result.data.status == '1' ? true : false
    address.areaCode = result.data.district || result.data.city || result.data.province
  }

  const save = async (info) => {
    var data = {
      id: addrid,
      busid: business.id,
      consignee: info.name,
      mobile: info.tel,
      address: info.addressDetail,
      code: info.areaCode,
      status: info.isDefault
    }

    var result = await POST({ url: '/address/edit', params: data })

    if(result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => { router.go(-1) }
    })
  }

  const del = async () => {
    showConfirmDialog({
      title: '删除提醒',
      message: '是否确认删除地址',
    })
    .then(async () => {
      var result = await POST({
        url: '/address/del',
        params: { id: addrid, busid: business.id }
      })
      if(result.code != 0) { router.go(-1) }
    })
    .catch(() => {})
  }

  onBeforeMount(() => { info() })
</script>