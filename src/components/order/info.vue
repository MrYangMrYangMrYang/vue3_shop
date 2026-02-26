<template>
  <div>
    <van-sticky>
      <!-- 导航栏 -->
      <van-nav-bar
        title="商品详情"
        left-arrow
        left-text="返回"
        @click-left="back"
      />
    </van-sticky>

    <link href="/css/indent-details.css" rel="stylesheet" />
    <div class="near-box">
      <div class="jd-qrdd-bigbox">
        <!-- 物流部分 -->
        <div class="indent-details-box">
          <div class="express" v-if="express">
            <span class="indent-details-img1"></span>
            <span class="indent-details-text1">{{list.status_text}}</span>
            <span class="indent-details-text2">物流公司：{{express.expName}}</span>
            <span class="indent-details-text2">物流单号：{{list.exfasscode}}</span>
            <span class="indent-details-text2" v-if="express.courier">物流联系人：{{express.courier}}</span>
            <span class="indent-details-text2" v-else>物流联系人：未知</span>
            <span class="indent-details-text2">联系人电话：{{express.courierPhone}}</span>
          </div>
          <div v-else class="noinfo"><span class="indent-details-img1"></span>暂无物流信息</div>
        </div>
        <!--地址部分-->
        <div class="jd-qrdd-a1">
          <span class="qrdd-a1-t1">{{list.address.consignee}}</span>
          <span class="qrdd-a1-t1">{{list.address.mobile}}</span>
          <span class="qrdd-a1-t2">默认</span>
          <div class="qrdd-a1-b1">
            <span class="qrdd-a1-img1"></span>
            <span class="qrdd-a1-t3" style="margin-top:0.5px">{{list.address.address_text}}/&nbsp;{{list.address.address}}</span>
          </div>
          <span class="qrdd-a1-img2"></span>
        </div>
        <!--商品部分-->
        <div>
          <div class="zjzz-buylist-goods1" v-for="pro in prolist" :key="pro.id">
            <div class="zjzz-buylist-gtime">
              <span class="zjzz-buylist-gtime1"
                ><i class="indent-details-img2"></i>官方旗舰店</span
              >
            </div>
            <div class="zjzz-buylist-det">
              <img :src="pro.ordproduct.thumbs_text" />
              <div class="zjzz-buylist-gdetail">
                <span class="zjzz-buylist-gtit1">{{pro.ordproduct.name}}</span>
                <span class="zjzz-buylist-gmoney">
                  <i class="zjzz-buylist-gm1">￥{{pro.price}}</i>
                  <i class="zjzz-buylist-gm2">x{{pro.pronum}}</i>
                </span>
              </div>
            </div>
            <!-- <div class="zjzz-buylist-btn">
              <a class="zjzz-buylist-btn3">退换</a>
            </div> -->
          </div>
          <span class="zjzz-buylist-gtime2" @click="contacts">联系客服</span>
          <!--商品金额部分-->
          <div class="indent-details-box2">
            <span class="indent-details-text4 tcolor-grey">商品总价</span>
            <span class="indent-details-text5 tcolor-black">￥{{price}}</span>
          </div>
          <div class="indent-details-box2">
            <span class="indent-details-text4 tcolor-grey">运费</span>
            <span class="indent-details-text5 tcolor-black">￥0.00</span>
          </div>
          <div class="indent-details-box2">
            <span class="indent-details-text4 tcolor-grey">运险费</span>
            <span class="indent-details-text5 tcolor-black">￥0.00</span>
          </div>
          <div class="indent-details-box2">
            <span class="indent-details-text4 tcolor-grey">店铺优惠</span>
            <span class="indent-details-text5 tcolor-black">￥0.00</span>
          </div>    
          <div class="indent-details-box2">
            <span class="indent-details-text4">应付总额</span>
            <span class="indent-details-text5">￥{{price}}</span>
          </div>   
        </div>
        <!--订单编号部分-->
        <div class="indent-details-box3" v-if="list">
          <p>订单编号:{{ list.code }}</p>
          <p>支付交易单号:{{ list.code }}</p>
          <p>下单时间:{{ list.createtime_text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router"
import { reactive, ref, onBeforeMount, computed } from "vue"
import { POST, UPLOAD } from "@/services/request"
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant"
import { useCookies } from "vue3-cookies"

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

let list = ref([])
let prolist = ref([])
let contact = ref("")
let express = ref([])

//获取用户信息
var login = cookies.get("business") ? cookies.get("business") : {}
var busid = login.hasOwnProperty("id") ? login.id : 0

// 获取订单ID
var orderid = route.query.hasOwnProperty("orderid") ? route.query.orderid : 0

// console.log(orderid)

// 返回
const back = () => {
  router.go(-1)
}

// 联系客服
const contacts = () => {
  showConfirmDialog({
    title: "拨打提醒",
    message: "是否确认拨打客服电话",
  })
    .then(() => {
      location.href = `tel:${contact.value}`
    })
    .catch(() => {})
}

onBeforeMount(async() => {
  await getInfo()
  await expressinfo()
  await getproductinfo()
})

// 查询地址详情
const getInfo = async () => {
  var data = {
    busid: busid,
    orderid: orderid,
  }

  var result = await POST({
    url: "/order/addressinfo",
    params: data,
  })

  list.value = result.data
  // list.value = list.value.concat(result.data)
  // console.log(list.value)
}

// 查询快递物流
const expressinfo = async () => {
  var result = await POST({
    url: "/order/express",
    params: {
      busid: busid,
      orderid: orderid,
    },
  })
  // console.log(result);
  express.value = result.data;
  // console.log(expressin.value);
  // return false
}

// 查询商品详情
const getproductinfo = async () => {
  var result = await POST({
    url: "/order/proinfo",
    params: {
      busid: busid,
      orderid: orderid,
    },
  })

  // console.log(result.data)
  contact.value = result.data.contact
  prolist.value = result.data.prolist
}

//计算价格 计算属性
let price = computed(() => {
  var count = 0

   prolist.value.map((item) => {
    count += parseFloat(item.total)
  })

  return count
})
</script>


<style scoped>
.noinfo {
  font-size: 24px;
  line-height: 111px;
  color: white;
}
.height {
  height: 1px !important;
}
.zjzz-buylist-gtime2 {
  margin: 0 25px;
  font-size: 15px;
}
</style>