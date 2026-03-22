<template>
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      :title="TypeName"
      left-arrow
      left-text="返回"
      @click-left="back"
    >
      <template #right>
        <van-icon name="search" size="18" @click="SearchShow = true" />
      </template>
    </van-nav-bar>

    <van-popup v-model:show="SearchShow" position="top">
      <van-search @search="search" v-model="keywords" placeholder="请输入搜索关键词" />
    </van-popup>

    <!-- 下拉筛选 -->
    <van-dropdown-menu>
      <van-dropdown-item v-model="TypeActive" :options="TypeList" @change="TypeToggle" />
      <van-dropdown-item v-model="FlagActive" :options="FlagList" @change="FlagToggle" />
      <van-dropdown-item v-model="SortActive" :options="SortList" @change="SortToggle" />
      <van-dropdown-item v-model="ByActive" :options="ByList" @change="ByToggle" />
    </van-dropdown-menu>

  </van-sticky>

  <!-- 列表 -->
  <van-pull-refresh v-model="refreshing" @refresh="refresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :offset="10"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="load"
    >
      <ul class="proul">
        <!-- 修复：添加 :key -->
        <li v-for="item in list" :key="item.id">
         <router-link :to="{path: '/product/info', query:{proid: item.id}}">
            <img :src="item.thumbs_text" style="width:190px;height:160px;"/>
         </router-link>
         <router-link :to="{path: '/product/info', query:{proid: item.id}}">
            <p class="tit">{{item.name}}</p>
          </router-link>
          <div class="price">
            <p>￥{{item.price}}</p>
          </div>
        </li>
      </ul>
    </van-list>
  </van-pull-refresh>

  <!-- 返回顶部 -->
  <van-back-top right="20" bottom="60" />

  <!-- 引入公共组件 -->
  <Menu />
</template>

<script setup>
  import {useRouter, useRoute, onBeforeRouteUpdate} from 'vue-router'
  import {reactive, ref, onBeforeMount, onMounted, watch} from 'vue'
  import {POST, UPLOAD} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import Menu from '@/components/common/Menu.vue'

  const router = useRouter()
  const route = useRoute()
  
  let TypeActive = ref(route.query.typeid ? parseInt(route.query.typeid) : 0);
  let list = ref([])
  let loading = ref(false)
  let finished = ref(false)
  let refreshing = ref(false)
  let page = ref(1)
  let TypeName = ref('全部商品')
  let FlagActive = ref('0')
  let SortActive = ref('createtime')
  let ByActive = ref('desc')
  let SearchShow = ref(false)
  let keywords = ref('')
  let isFirstLoad = ref(true)  // 添加标记，避免重复加载

  let FlagList = [
    {text: '全部商品', value: '0'},
    {text: '新品', value: '1'},
    {text: '热销', value: '2'},
    {text: '推荐', value: '3'},
  ];

  let TypeList = ref([
    {text: '全部分类', value: 0}
  ]);

  let SortList = [
    {text: '按上架时间', value: 'createtime'},
    {text: '按价格', value: 'price'},
    {text: '按库存', value: 'stock'}
  ];

  let ByList = [
    {text: '降序', value: 'desc'},
    {text: '升序', value: 'asc'},
  ];

  // 修复：添加防抖标志，避免重复请求
  let isLoading = ref(false)

  // 分类切换
  const TypeToggle = async (value) =>
  {
    if (TypeActive.value === value) return
    TypeActive.value = value
    refresh()
  }

  // 属性切换
  const FlagToggle = async (value) =>
  {
    if (FlagActive.value === value) return
    FlagActive.value = value
    refresh()
  }

  // 排序切换
  const SortToggle = async (value) =>
  {
    if (SortActive.value === value) return
    SortActive.value = value
    refresh()
  }

  // 排序切换
  const ByToggle = async (value) =>
  {
    if (ByActive.value === value) return
    ByActive.value = value
    refresh()
  }

  // 搜索
  const search = async (value) =>
  {
    SearchShow.value = false
    keywords.value = value
    refresh()
  }

  const back = () =>
  {
    router.go(-1)
  }

  // 下拉刷新
  const refresh = async () =>
  {
    if (isLoading.value) return  // 防止重复刷新
    isLoading.value = true
    
    page.value = 1
    finished.value = false
    list.value = []
    
    await ListData()
    
    isLoading.value = false
  }

  // 上拉加载
  const load = async () =>
  {
    if (finished.value || isLoading.value) return  // 已加载完或正在加载时不再加载
    
    if(refreshing.value)
    {
      refreshing.value = false
    }
    
    await ListData()
  }

  // 接口请求数据
  const ListData = async () =>
  {
    if (isLoading.value && page.value > 1) return  // 防止并发请求
    
    isLoading.value = true
    
    try {
      var result = await POST({
        url: '/index/list',
        params: {
          typeid: TypeActive.value,
          page: page.value,
          flag: FlagActive.value,
          sort: SortActive.value,
          by: ByActive.value,
          keywords: keywords.value
        }
      })

      loading.value = false
      TypeName.value = result.data.TypeName

      if(result.code == 0 || !result.data.list || result.data.list.length <= 0)
      {
        finished.value = true;
      } else {
        if (page.value === 1) {
          list.value = result.data.list
        } else {
          list.value = list.value.concat(result.data.list)
        }
        page.value++
      }
    } catch (error) {
      console.error('请求失败:', error)
      loading.value = false
    } finally {
      isLoading.value = false
    }
  }

  // 请求分类
  const type = async () => 
  {
    try {
      var result = await POST({
        url: '/index/type'
      })

      TypeList.value = [
        {text: '全部分类', value: 0}
      ];

      if (result.data && result.data.length) {
        for(var item of result.data)
        {
          TypeList.value.push({
            text: item.name,
            value: parseInt(item.id)
          })
        }
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  // 修复：监听路由参数变化，但避免重复请求
  watch(() => route.query.typeid, (newTypeId, oldTypeId) => {
    // 只有参数真正变化且不是初始加载时才刷新
    if (newTypeId !== oldTypeId && !isFirstLoad.value) {
      TypeActive.value = newTypeId ? parseInt(newTypeId) : 0
      refresh()
    }
  })

  // 修复：使用 onMounted 替代 onBeforeMount，并避免重复加载
  onMounted(async () => {
    // 先加载分类
    await type()
    // 标记初始加载完成
    isFirstLoad.value = false
    // 加载数据
    await refresh()
  })
</script>