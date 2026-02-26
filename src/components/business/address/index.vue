<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="收货地址"
    left-arrow
    left-text="返回"
    @click-left="back"
  />

  <!-- 从确认订单界面过来的 -->
  <van-address-list
    v-if="action == 'order'"
    v-model="active"
    :list="list"
    default-tag-text="默认"
    @add="add"
    @edit="edit"
    @select="order"
  />
  <!-- 地址列表 -->
  <van-address-list
    v-else
    v-model="active"
    :list="list"
    default-tag-text="默认"
    @add="add"
    @edit="edit"
    @select="select"
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

  //获取用户信息
  var business = cookies.get('business') ? cookies.get('business') : {};

  //初始化数据
  const list = reactive([])
  const active = ref('')
  
  //获取自定义的参数
  var action = route.query.hasOwnProperty('action') ? route.query.action : ''
  action = ref(action)

  const back = () =>
  {
    router.go(-1)
  }

  const add = () =>
  {
    //跳转
    router.push('/business/address/add')
  }

  const edit = (item) =>
  {
    router.push({path: '/business/address/edit', query:{id:item.id}})
  }

  //切换默认地址
  const select = async (item, index) =>
  {
    // console.log(item,index)
    //封装数据
    var data = {
      busid: business.id,
      id: item.id
    }

    //发请求
    var result = await POST({
      url: '/address/toggle',
      params: data
    })

    //更新失败
    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    //切换默认标签
    active.value = item.id

    //清除全部的默认选中
    list.map((item) => {
      item.isDefault = false
    })
    
    list[index].isDefault = true
  }

  //订单切换地址
  const order = async (item, index) =>
  {
    cookies.set('address', item.id)
    router.go(-1)
  }

  //通过挂载前执行的生命周期钩子函数来显示页面数据
  onBeforeMount(async () => {
    var result = await POST({
      url: '/address/index',
      params: {busid: business.id}
    })

    if(result.code == 0 || result.data.length <= 0)
    {
      showFailToast(result.msg)
      return false
    }

    for(var item of result.data)
    {
      var status = item.status == '1' ? true : false

      //找出默认收货地址
      if(status)
      {
        active.value = item.id
      }

      list.push({
        id: item.id,
        name: item.consignee,
        tel: item.mobile,
        address: `${item.address_text} ${item.address}`,
        isDefault: status
      })
    }
  })
</script>