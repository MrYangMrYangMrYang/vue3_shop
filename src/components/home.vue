<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  
  <!-- 头部 -->
  <div class="topBox">
    <div class="L"><a>{{site}}</a></div>
    <div class="C">
      <div class="saerchbox" >
        <van-search @search="search" v-model="keywords" placeholder="请输入搜索关键词" />
      </div>
    </div>
  </div>

  <!-- 轮播图 -->
  <van-swipe class="aui-m-slider" :autoplay="3000" indiactor-color="white">
    <van-swipe-item v-for="item in hots">
      <router-link :to="{path: '/product/info', query:{proid: item.id}}">
        <img :src="item.thumbs_text" style="width:100%;height:300px" />
      </router-link>
    </van-swipe-item>
  </van-swipe>
  
  <!-- 分类 -->
  <div class="lqgwBox">
    <ul>
      <li>
        <router-link to="/product/list">
          <img src="/images/fenlei.png">
          <p>全部分类</p>
        </router-link>
      </li>
      <li v-for="item in typelist">
        <router-link :to="{path: '/product/list', query:{typeid: item.id}}">
          <img :src="item.thumb_text">
          <p>{{item.name}}</p>
        </router-link>       
      </li>
    </ul>
  </div>

  <!-- 广告图 -->
  <!-- <div class="adBox">
    <router-link :to="{path: '/product/info', query:{proid: news.id}}">
      <img :src="news.thumbs_text">
    </router-link>
  </div> -->
  
  <!-- 推荐商品 -->
  <ul class="proul">
    <p class="tj">好物推荐：</p>
    <li v-for="item in recommend">
      <div class="con">
        <router-link :to="{path: '/product/info', query:{proid: item.id}}">
          <img :src="item.thumbs_text" style="width:100%;height:150px;"/>
          <p class="title">{{item.name}}</p>
          <p>
            <span>￥</span>{{item.price}}
          </p>
        </router-link>
      </div>
    </li>
  </ul>

  <!-- 引入公共组件 -->
  <Menu />
</template>

<script setup>
  import {POST, UPLOAD} from '@/services/request'
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount} from 'vue'
  import Menu from '@/components/common/Menu.vue'

  let typelist = ref([])
  let recommend = ref([])
  let news = ref({})
  let hots = ref([])
  let site = ref('精品家居')

  let keywords = ref('')

  const router = useRouter()
  const route = useRoute()

  //数据获取
  onBeforeMount(async () => {
    var result = await POST({
      url: '/index/index',
    })

    typelist.value = result.data.typelist
    recommend.value = result.data.recommend
    // news.value = result.data.news
    hots.value = result.data.hots
    // site.value = result.data.site
  })

  //搜索
  const search = async (value) =>
  {
    keywords.value = value

    var result = await POST({
      url: '/index/index',
      params: {
        keywords:keywords.value
      }
    })

    console.log(result.data);

    router.push({
      path: '/product/list',
      query: {
        typeid: result.data.search.id
      }
    })
  }
</script>