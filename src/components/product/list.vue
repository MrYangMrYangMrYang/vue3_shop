<!-- 
  @fileoverview 商品搜索结果列表组件
  @module components/product/list
  @description 负责根据关键词搜索并展示商品列表，支持多维度排序（销量、价格、库存等），
               支持分类筛选、新品/热销/推荐标签过滤，提供下拉刷新与上拉加载更多功能
  @requires services/request
  @requires utils/cache
  @example
  // 路由配置: /product/list
  // 分类筛选: ?typeid=1, 搜索: ?keywords=手机
  <router-link to="/product/list">商品列表</router-link>
-->
<template>
  <div class="list-page">
    <van-sticky>
      <div class="nav-header">
        <van-nav-bar
          :title="TypeName"
          left-arrow
          left-text="返回"
          @click-left="back"
        >
          <template #right>
            <van-icon name="search" size="20" @click="SearchShow = true" />
          </template>
        </van-nav-bar>

        <van-popup v-model:show="SearchShow" position="top" :style="{ height: 'auto' }">
          <div class="search-box">
            <van-search @search="search" v-model="keywords" placeholder="请输入搜索关键词" shape="round" background="#fff" />
          </div>
        </van-popup>

        <van-dropdown-menu class="filter-menu">
          <van-dropdown-item v-model="TypeActive" :options="TypeList" @change="TypeToggle" />
          <van-dropdown-item v-model="FlagActive" :options="FlagList" @change="FlagToggle" />
          <van-dropdown-item v-model="SortActive" :options="SortList" @change="SortToggle" />
          <van-dropdown-item v-model="ByActive" :options="ByList" @change="ByToggle" />
        </van-dropdown-menu>
      </div>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="refresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :offset="10"
        :immediate-check="false"
        finished-text="没有更多了"
        @load="load"
      >
        <ul class="product-list" v-if="list.length > 0">
          <li v-for="item in list" :key="item.id" class="product-item">
            <router-link :to="{path: '/product/info', query:{proid: item.id}}" class="product-link">
              <div class="img-wrapper">
                <img v-lazy="item.thumbs_text" />
              </div>
              <div class="product-content">
                <p class="title">{{item.name}}</p>
                <div class="bottom-row">
                  <span class="price">{{item.price}}</span>
                  <span class="sales">销量 {{item.sales || 0}}</span>
                </div>
              </div>
            </router-link>
          </li>
        </ul>

        <!-- 空状态 -->
        <van-empty
          v-else-if="!loading && finished"
          description="没有找到相关商品"
          image="search"
        >
          <van-button round type="primary" class="back-home-btn" @click="resetFilters">
            查看全部商品
          </van-button>
        </van-empty>
      </van-list>
    </van-pull-refresh>

    <van-back-top right="20" bottom="70" />

    <Menu />
  </div>
</template>

<script setup>
// 商品列表页：
// 负责分类筛选、搜索、分页加载、返回态恢复与列表状态缓存。
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { ref, onMounted, watch, nextTick, onBeforeUnmount, onActivated } from 'vue'
import { POST } from '@/services/request'
import { showFailToast } from 'vant'
import Menu from '@/components/common/Menu.vue'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { getCache, setCache } from '@/utils/cache'
import { useBack } from '@/hooks'

defineOptions({
  name: 'product-list'
})

const router = useRouter()
const route = useRoute()
const back = useBack()

const parseTypeId = (value) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

let TypeActive = ref(parseTypeId(getRouteQueryValue(route.query, 'typeid', 0)))
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
let isFirstLoad = ref(true)
let isLoading = ref(false)
let isFromDetail = ref(false)
const LIST_STATE_CACHE_KEY = 'product:list:view-state'

let FlagList = [
  { text: '全部商品', value: '0' },
  { text: '新品', value: '1' },
  { text: '热销', value: '2' },
  { text: '推荐', value: '3' },
];

let TypeList = ref([
  { text: '全部分类', value: 0 }
]);
const TYPE_CACHE_KEY = 'product:type:list'
const TYPE_CACHE_TTL = 5 * 60 * 1000

let SortList = [
  { text: '上架时间', value: 'createtime' },
  { text: '价格', value: 'price' },
  { text: '库存', value: 'stock' }
];

let ByList = [
  { text: '降序', value: 'desc' },
  { text: '升序', value: 'asc' },
];

const TypeToggle = async (value) => {
  TypeActive.value = value
  isFromDetail.value = false
  await refresh()
}

const FlagToggle = async (value) => {
  FlagActive.value = value
  isFromDetail.value = false
  await refresh()
}

const SortToggle = async (value) => {
  SortActive.value = value
  isFromDetail.value = false
  await refresh()
}

const ByToggle = async (value) => {
  ByActive.value = value
  isFromDetail.value = false
  await refresh()
}

const resetFilters = async () => {
  TypeActive.value = 0
  FlagActive.value = '0'
  SortActive.value = 'createtime'
  ByActive.value = 'desc'
  keywords.value = ''
  await refresh()
}

const search = async (value) => {
  SearchShow.value = false
  keywords.value = value
  isFromDetail.value = false
  await refresh()
}

const restoreListState = () => {
  const cached = getCache(LIST_STATE_CACHE_KEY)
  if (!cached || typeof cached !== 'object') return false
  TypeActive.value = parseTypeId(cached.typeActive)
  FlagActive.value = cached.flagActive || '0'
  SortActive.value = cached.sortActive || 'createtime'
  ByActive.value = cached.byActive || 'desc'
  keywords.value = cached.keywords || ''
  page.value = Number(cached.page) || 1
  finished.value = Boolean(cached.finished)
  list.value = Array.isArray(cached.list) ? cached.list : []
  return list.value.length > 0
}

const saveListState = () => {
  setCache(LIST_STATE_CACHE_KEY, {
    typeActive: TypeActive.value,
    flagActive: FlagActive.value,
    sortActive: SortActive.value,
    byActive: ByActive.value,
    keywords: keywords.value,
    page: page.value,
    finished: finished.value,
    list: list.value,
    scrollTop: window.scrollY || 0
  }, 10 * 60 * 1000)
}

const refresh = async () => {
  if (isLoading.value) return

  isLoading.value = true
  page.value = 1
  finished.value = false
  list.value = []

  await ListData()

  isLoading.value = false
  isFromDetail.value = false
}

const load = async () => {
  if (finished.value || isLoading.value) return

  if (refreshing.value) {
    refreshing.value = false
  }

  await ListData()
}

const ListData = async () => {
  if (isLoading.value && page.value > 1) return

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
    const data = result.data || {}
    TypeName.value = data.TypeName || '全部商品'

    if (isBizFail(result) || !data.list || data.list.length <= 0) {
      finished.value = true;
    } else {
      if (page.value === 1) {
        list.value = data.list
      } else {
        list.value = list.value.concat(data.list)
      }
      page.value++
      saveListState()
    }
  } catch (error) {
    loading.value = false
    showFailToast('商品列表加载失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const type = async () => {
  const cachedTypeList = getCache(TYPE_CACHE_KEY)
  if (cachedTypeList && Array.isArray(cachedTypeList) && cachedTypeList.length) {
    TypeList.value = cachedTypeList
    return
  }

  try {
    var result = await POST({
      url: '/index/type'
    })

    TypeList.value = [
      { text: '全部分类', value: 0 }
    ];

    if (Array.isArray(result.data) && result.data.length) {
      for (var item of result.data) {
        TypeList.value.push({
          text: item.name,
          value: parseInt(item.id)
        })
      }
    }
    setCache(TYPE_CACHE_KEY, TypeList.value, TYPE_CACHE_TTL)
  } catch (error) {
    showFailToast('分类加载失败，请稍后重试')
  }
}

watch(() => route.query.typeid, (newTypeId, oldTypeId) => {
  if (newTypeId !== oldTypeId && !isFirstLoad.value) {
    TypeActive.value = parseTypeId(newTypeId)
    isFromDetail.value = false
    refresh()
  }
})

onActivated(() => {
  if (isFromDetail.value && restoreListState()) {
    nextTick(() => {
      const cached = getCache(LIST_STATE_CACHE_KEY)
      const scrollTop = Number(cached?.scrollTop || 0)
      window.scrollTo(0, scrollTop)
    })
    isFromDetail.value = false
  }
})

onBeforeRouteUpdate((to, from) => {
  if (from.path === '/product/info' && to.path === '/product/list') {
    isFromDetail.value = true
  }

  if (to.query.typeid !== from.query.typeid) {
    TypeActive.value = parseTypeId(to.query.typeid)
    isFromDetail.value = false
    refresh()
  }
})

onBeforeUnmount(() => {
  saveListState()
  loading.value = false
  finished.value = true
  refreshing.value = false
  isLoading.value = true
})

onMounted(async () => {
  await type()
  isFirstLoad.value = false
  const restored = restoreListState()
  await nextTick()
  if (restored) {
    const cached = getCache(LIST_STATE_CACHE_KEY)
    const scrollTop = Number(cached?.scrollTop || 0)
    window.scrollTo(0, scrollTop)
    return
  }
  await refresh()
})
</script>

<style scoped>
.list-page {
  background: #F7F8FA;
  min-height: 100vh;
  padding-bottom: 70px;
}

.nav-header {
  background: white;
}

:deep(.van-nav-bar) {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title) {
  color: white;
}

:deep(.van-nav-bar__left) {
  color: white;
}

:deep(.van-nav-bar__left .van-icon) {
  color: white;
}

:deep(.van-nav-bar__left span) {
  color: white;
}

:deep(.van-nav-bar__right .van-icon) {
  color: white;
}

:deep(.van-dropdown-menu__bar) {
  height: 44px;
  box-shadow: 0 2px 8px rgba(255, 70, 78, 0.06);
}

:deep(.van-dropdown-menu__title) {
  color: #323233;
  font-size: 14px;
}

:deep(.van-dropdown-menu__title--active) {
  color: var(--primary-color) !important;
}

:deep(.van-dropdown-item__option--active) {
  color: var(--primary-color) !important;
}

:deep(.van-dropdown-item__option--active .van-dropdown-item__icon) {
  color: var(--primary-color) !important;
}

:deep(.van-dropdown-menu__title::after) {
  border-color: transparent transparent #323233 #323233;
}

:deep(.van-dropdown-menu__title--active::after) {
  border-color: transparent transparent var(--primary-color) var(--primary-color) !important;
}

.back-home-btn {
  width: 160px;
  background: var(--primary-gradient);
  border: none;
}

.search-box {
  padding: 12px 16px;
  background: white;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
  margin: 0;
}

.product-item {
  list-style: none;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(255, 70, 78, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-item:active {
  transform: scale(0.98);
}

.product-link {
  display: block;
  text-decoration: none;
}

.img-wrapper {
  width: 100%;
  height: 0;
  padding-bottom: 85%;
  position: relative;
  overflow: hidden;
  background: #F7F8FA;
}

.img-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 12px;
}

.title {
  font-size: 14px;
  color: #323233;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 16px;
}

.sales {
  font-size: 11px;
  color: #969799;
}

:deep(.van-list__finished-text) {
  color: #969799;
  font-size: 12px;
  padding: 16px 0;
}

:deep(.van-back-top) {
  background: linear-gradient(135deg, #FF464E 0%, #FF8A5C 100%);
  box-shadow: 0 4px 16px rgba(255, 70, 78, 0.4);
}

:deep(.van-back-top__icon) {
  color: white;
}
</style>
