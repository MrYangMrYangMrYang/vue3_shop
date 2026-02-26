<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="添加地址"
    left-arrow
    left-text="返回"
    @click-left="back"
  />

  <!-- 地址组件 -->
  <van-address-edit
    :area-list="areaList"
    show-set-default
    :area-columns-placeholder="['请选择', '请选择', '请选择']"
    @save="save"
  />
</template>

<script setup>
  import {useRouter} from 'vue-router'
  import {reactive, ref} from 'vue'
  import { areaList } from '@vant/area-data'
  import { useCookies } from "vue3-cookies";
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'


  //初始化
  const {cookies} = useCookies()
  const router = useRouter()

  //获取用户信息
  var business = cookies.get('business') ? cookies.get('business') : {};

  const back = () =>
  {
    router.go(-1)
  }

  const save = async (info) =>
  {
    //组装数据
    var data = {
      busid: business.id,
      consignee: info.name,
      mobile: info.tel,
      address: info.addressDetail,
      code:info.areaCode,
      status: info.isDefault
    }

    //请求
    var result = await POST({
      url: '/address/add',
      params: data
    })

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => 
      {
        //跳转
        router.go(-1)
      }
    })

  }
</script>