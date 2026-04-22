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

:deep(.van-button--danger) {
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
  import {useRouter} from 'vue-router'
  import { areaList } from '@vant/area-data'
  import { useCookies } from "vue3-cookies";
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast} from 'vant'

  const {cookies} = useCookies()
  const router = useRouter()
  var business = cookies.get('business') ? cookies.get('business') : {};

  const back = () => {
    router.go(-1)
  }

  const save = async (info) => {
    var data = {
      busid: business.id,
      consignee: info.name,
      mobile: info.tel,
      address: info.addressDetail,
      code: info.areaCode,
      status: info.isDefault
    }

    var result = await POST({
      url: '/address/add',
      params: data
    })

    if(result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => {
        router.go(-1)
      }
    })
  }
</script>