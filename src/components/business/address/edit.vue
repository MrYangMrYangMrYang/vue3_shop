<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="编辑地址"
    left-arrow
    left-text="返回"
    @click-left="back"
  />

  <!-- 地址组件 -->
  <van-address-edit
    :area-list="areaList"
    :address-info="address"
    show-set-default
    show-delete
    :area-columns-placeholder="['请选择', '请选择', '请选择']"
    @save="save"
    @delete="del"
  />
</template>

<script setup>
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount} from 'vue'
  import { areaList } from '@vant/area-data'
  import { useCookies } from "vue3-cookies";
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'

  //初始化
  const {cookies} = useCookies()
  const router = useRouter()
  const route = useRoute()

  //接收id
  var addrid = route.query.hasOwnProperty('id') ? route.query.id : 0;

  //获取用户信息
  var business = cookies.get('business') ? cookies.get('business') : {};

  const address = reactive({})

  const back = () =>
  {
    router.go(-1)
  }

  //显示数据
  const info = async () => 
  {
    //组装数据
    var data = {
      busid: business.id,
      id: addrid
    }

    var result = await POST({
      url: '/address/info',
      params: data
    })

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    address.name = result.data.consignee
    address.tel = result.data.mobile
    address.addressDetail = result.data.address
    address.isDefault = result.data.status == '1' ? true : false

    address.areaCode = result.data.district || result.data.city || result.data.province
  }

  //更改数据
  const save = async (info) =>
  {
    //组装数据
    var data = {
      id: addrid,
      busid: business.id,
      consignee: info.name,
      mobile: info.tel,
      address: info.addressDetail,
      code:info.areaCode,
      status: info.isDefault
    }

    //请求
    var result = await POST({
      url: '/address/edit',
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

  //删除数据
  const del = async (info) => 
  {
    // 组装数据
    var data = {
      id:addrid,
      busid: business.id
    }
    
    //确认对话框
    showConfirmDialog({
      title: '删除提醒',
      message: '是否确认删除地址',
    })
    .then(async () => {
      //发送请求
      var result = await POST({
        url: '/address/del',
        params: data
      })

      if(result.code == 0)
      {
        showFailToast(result.msg)
        return false
      }else
      {
        router.go(-1)
      }
    })
    .catch(() => {})

  }
  //一进来就调用数据请求
  onBeforeMount(() => {
    info()
  })
</script>