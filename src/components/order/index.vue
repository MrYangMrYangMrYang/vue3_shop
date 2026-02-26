<template>
  <link rel="stylesheet" href="/css/order.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      title="订单列表"
      left-arrow
      left-text="返回"
      @click-left="back" 
    />

    <!-- 选项卡 -->
    <van-tabs v-model:active="active" animated @change="TabChange">
      <van-tab title="全部订单" name="0"></van-tab>
      <van-tab title="待发货" name="1"></van-tab>
      <van-tab title="待收货" name="2"></van-tab>
      <van-tab title="待评价" name="3"></van-tab>
      <van-tab title="已完成" name="4"></van-tab>
      <van-tab title="退货中" name="-1"></van-tab>
    </van-tabs>
  </van-sticky>

  <!-- 下拉列表 -->
  <van-pull-refresh v-model="refreshing" @refresh="refresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :offset="10"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="load"
    >
      <div class="list-box">
        <div class="list">
          <div class="item" v-for="order in list">
            <div class="item-left">
              <img :src="order.thumbs_text" alt="">
            </div>
            <div class="item-right">
              <div class="item">订单编号：{{order.code}}</div>
              <div class="item">商品名称：{{order.name_text}}</div>
              <div class="item">下单时间：{{order.createtime_text}}</div>
              <div class="item">订单金额：￥{{order.amount}}</div>
              <div class="item">订单状态：{{order.status_text}}</div>
            </div>
            <div class="btn-box">
               <van-button type="primary" size="small" @click="goinfo(order.id)">详情</van-button>

              <van-button plain type="primary" size="small" v-if="order.status == '1'" @click="cuihahuo">催发货</van-button>

              <van-button plain type="primary" size="small" v-if="order.status == '2' && order.exfasscode" @click="express(order.id)">查看物流</van-button>
              
              <van-button type="success" size="small" v-if="order.status == '2'" @click="confirm(order.id)">确认收货</van-button>

              <van-button type="warning" size="small" v-if="order.status == '3'" @click="eveluate(order.id)">评价</van-button>

              <van-button type="danger" size="small" v-if="order.status == '4'" @click="depot(order.id)">退货</van-button>

              <van-button type="danger" plain size="small" v-if="order.status == '-1'" disabled>审核中</van-button>
            </div>
          </div>
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
  
</template>

<script setup>
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount, computed} from 'vue'
  import {POST, UPLOAD} from '@/services/request'
  import {showToast, showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import { useCookies } from "vue3-cookies";

  const router = useRouter()
  const route = useRoute()
  const {cookies} = useCookies()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  var busid = login.hasOwnProperty('id') ? login.id : 0;

  let active = ref(0)
  let list = ref([])
  let loading = ref(false)
  let finished = ref(false)
  let refreshing = ref(false)
  let page = ref(1)

  const back = () => 
  {
    router.go(-1)
  }

  //生命周期
  onBeforeMount(async () => {
  })

  // 选项卡切换 一进来是先触发了选项卡
  let TabChange = () => 
  {
    //调用获取订单的请求方法
    page.value = 1
    finished.value = false
    loading.value = true
    list.value = []
    load()
  }

  //下拉刷新
  const refresh = async () =>
  {
    page.value = 1
    finished.value = false
    loading.value = true
    list.value = []
    load()
  }

  //上拉加载
  const load = async () =>
  {
    //检测刷新的属性
    if(refreshing.value)
    {
      refreshing.value = false
    }
    
    OrderData()
  }

  //获取订单请求方法
  let OrderData = async () =>
  {
    var result = await POST({
      url: '/order/index',
      params: {
        busid: busid,
        status: active.value,
        page: page.value,
      }
    })

    // 拿到结果后，加载状态结束了
    loading.value = false

    // 判断在失败的时候，或者是没有数据的时候，设置没有更多数据的状态
    if(result.code == 0 || result.data.length <= 0)
    {
      finished.value = true;
    }else
    {
      list.value = list.value.concat(result.data)
      page.value++
    }
  }

  //催发货
  const cuihahuo = () =>{
    showToast('亲，已经在催了哟！')
  }

  //确认收货
  const confirm = (orderid) => {
    // console.log(orderid);
    showConfirmDialog({
      title: "确实收货提示",
      message: "您是否要确认收货",
    })
      .then(async () => {
        var result = await POST({
          url: "/order/conrce",
          params: {
            busid: busid,
            orderid: orderid,
          },
        });
        if (result.code == 0) {
          showFailToast(result.msg);
        } else {
          showSuccessToast(result.msg);
          refresh()
        }
      })
      .catch(() => {});
  };

  //退货
  const depot = (orderid) =>{
    showConfirmDialog({
      title: "退货提示",
      message: "您是否要进行退货",
    })
      .then(async () => {
        var result = await POST({
          url: "/order/depot",
          params: {
            busid: busid,
            orderid: orderid,
          },
        });
        if (result.code == 0) {
          showFailToast(result.msg);
        } else {
          showSuccessToast(result.msg);
          refresh()
        }
      })
      .catch(() => {});
  }

  // 跳转评价页面
  const eveluate = (id) => {
    router.push({
      path: "/order/eveluate",
      query: { orderid: id },
    });
  };

  // 跳转详情页面
  const goinfo = (id) => {
    // console.log(id);
    router.push({
      path: "/order/info",
      query: { orderid: id },
    });
  };

  //跳转物流界面
  let express = (orderid) =>
  {
    router.push({
      path: "/order/express",
      query:{orderid: orderid}
    })
  }
</script>

<style scoped>
  .list .item .item-right .item:nth-child(2){
    overflow:hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  img{
    border-radius: 10px;
  }
</style>