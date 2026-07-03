<!-- 
  @fileoverview 首页组件
  @module components/home
  @description 负责首页核心数据展示：包括商品分类快捷导航、热门商品轮播（Swipe）、好物推荐列表（Grid）及全局搜索入口，
               是应用的默认着陆页，支持数据缓存与关键词搜索跳转、首屏骨架屏与下拉刷新
  @requires services/request
  @requires utils/cache
  @requires components/common/Menu
  @example
  // 路由配置: / (首页，无需登录)
  <router-link to="/">首页</router-link>
-->
<template>
  <div class="home-page">
    <div class="topBox">
      <div class="logo">{{ site }}</div>
      <div class="search-wrapper">
        <van-search
          @search="search"
          @click-action="search(keywords)"
          v-model="keywords"
          placeholder="搜索商品..."
          shape="round"
          background="transparent"
          show-action
        >
          <template #action>
            <div class="search-action" @click="search(keywords)">搜索</div>
          </template>
        </van-search>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="home-refresh">
      <!-- 首屏骨架屏 -->
      <div v-if="loading" class="home-skeleton">
        <div class="sk-categories">
          <div v-for="i in 4" :key="i" class="sk-cat-item">
            <van-skeleton-avatar avatar-size="50px" />
            <van-skeleton-title title-width="36px" />
          </div>
        </div>
        <div class="sk-banner">
          <van-skeleton-image image-size="100%" />
        </div>
        <div class="sk-grid">
          <div v-for="i in 4" :key="i" class="sk-card">
            <van-skeleton-image image-size="100%" class="sk-card-img" />
            <van-skeleton-paragraph :row-width="['100%', '60%'] as unknown as string" />
          </div>
        </div>
      </div>

      <!-- 网络错误占位 -->
      <NetworkError v-else-if="hasError" @retry="retryHome" />

      <template v-else>
        <div class="category-section">
          <div class="category-wrapper">
            <router-link to="/product/list" class="category-item">
              <div class="category-icon">
                <van-icon name="apps-o" size="28" />
              </div>
              <span class="category-name">全部分类</span>
            </router-link>
            <router-link
              v-for="item in typelist"
              :key="item.id"
              :to="{ path: '/product/list', query: { typeid: item.id } }"
              class="category-item"
            >
              <div class="category-icon">
                <img v-lazy="item.thumb_text" :alt="item.name" />
              </div>
              <span class="category-name">{{ item.name }}</span>
            </router-link>
          </div>
        </div>

        <div class="hot-section">
          <div class="section-header">
            <span class="section-title">近日热门</span>
          </div>
          <van-swipe class="aui-m-slider" :autoplay="3000" indicator-color="white">
            <van-swipe-item v-for="item in hots" :key="item.id">
              <router-link :to="{ path: '/product/info', query: { proid: item.id } }" class="slider-link">
                <img v-lazy="item.thumbs_text" class="slider-img" :alt="item.name" />
              </router-link>
            </van-swipe-item>
          </van-swipe>
        </div>

        <div class="recommend-section">
          <div class="section-header">
            <span class="section-title">好物推荐</span>
            <router-link to="/product/list" class="more-link">查看更多 ›</router-link>
          </div>
          <ul class="product-grid">
            <li v-for="item in recommend" :key="item.id">
              <router-link :to="{ path: '/product/info', query: { proid: item.id } }" class="product-card">
                <div class="img-wrapper">
                  <img v-lazy="item.thumbs_text" :alt="item.name" />
                </div>
                <div class="product-info">
                  <p class="title text-ellipsis-2">{{ item.name }}</p>
                  <div class="price-row">
                    <span class="price">{{ item.price }}</span>
                    <span class="buy-btn">查看详情</span>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>

          <div v-if="recommend.length > 0" class="bottom-tip">
            <span class="tip-text">— 没有更多了 —</span>
          </div>
        </div>
      </template>
    </van-pull-refresh>

    <Menu />

    <van-back-top right="20" bottom="70" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Home' })

import { POST } from '@/services/request'
import { useRouter } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { showFailToast } from 'vant'
import Menu from '@/components/common/Menu.vue'
import NetworkError from '@/components/common/NetworkError.vue'
import { getCache, setCache } from '@/utils/cache'
import { debounce } from '@/utils/debounce'

/** 首页商品分类项 */
interface TypeListItem {
  id: string | number
  thumb_text: string
  name: string
}

/** 好物推荐商品项 */
interface RecommendItem {
  id: string | number
  thumbs_text: string
  name: string
  price: string | number
}

/** 热门商品项 */
interface HotItem {
  id: string | number
  name: string
  thumbs_text: string
}

/** 首页聚合数据（后端 /index/index 返回） */
interface HomeData {
  typelist?: TypeListItem[]
  recommend?: RecommendItem[]
  hots?: HotItem[]
  search?: { id: string | number }
}

const typelist = ref<TypeListItem[]>([])
const recommend = ref<RecommendItem[]>([])
const hots = ref<HotItem[]>([])
const site = ref('精品家居')
const keywords = ref('')
const loading = ref(true)
const hasError = ref(false)
const refreshing = ref(false)
const HOME_CACHE_KEY = 'home:index:data'
const HOME_CACHE_TTL = 5 * 60 * 1000

const router = useRouter()

/** 应用首页数据 */
const applyHomeData = (data: HomeData) => {
  typelist.value = data?.typelist || []
  recommend.value = data?.recommend || []
  hots.value = data?.hots || []
}

/** 拉取首页数据 */
const fetchHomeData = async () => {
  hasError.value = false
  try {
    const result = await POST({ url: '/index/index' })
    const data = (result.data || {}) as HomeData
    applyHomeData(data)
    setCache(HOME_CACHE_KEY, data, HOME_CACHE_TTL)
  } catch (error) {
    hasError.value = true
  } finally {
    loading.value = false
  }
}

/** 重试加载首页数据 */
const retryHome = () => {
  loading.value = true
  fetchHomeData()
}

onBeforeMount(async () => {
  const cachedData = getCache<HomeData>(HOME_CACHE_KEY)
  if (cachedData) {
    applyHomeData(cachedData)
    loading.value = false
    return
  }
  await fetchHomeData()
})

/** 下拉刷新（绕过缓存） */
const onRefresh = async () => {
  try {
    const result = await POST({ url: '/index/index' })
    const data = (result.data || {}) as HomeData
    applyHomeData(data)
    setCache(HOME_CACHE_KEY, data, HOME_CACHE_TTL)
  } catch (error) {
    showFailToast('刷新失败，请稍后重试')
  } finally {
    refreshing.value = false
  }
}

/** 搜索跳转（防抖） */
const search = debounce(async (value: string) => {
  if (!value || !value.trim()) return
  keywords.value = value
  try {
    const result = await POST({
      url: '/index/index',
      params: {
        keywords: keywords.value
      }
    })
    const searchTypeId = (result.data as HomeData)?.search?.id
    router.push({
      path: '/product/list',
      query: searchTypeId ? { typeid: searchTypeId } : { keywords: keywords.value }
    })
  } catch (error) {
    showFailToast('搜索失败，请稍后重试')
  }
}, 300)
</script>

<style scoped>
.home-page {
  background: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 60px;
}

.topBox {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 12px var(--spacing-md);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--shadow-sm);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  white-space: nowrap;
  margin-right: 12px;
  letter-spacing: 1px;
}

.search-wrapper {
  flex: 1;
}

:deep(.van-search) {
  padding: 0;
}

:deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-full);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.van-search__content:focus-within) {
  box-shadow: 0 0 0 2px rgba(255, 70, 78, 0.2);
}

.search-action {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  padding: 0 4px;
  white-space: nowrap;
}

.aui-m-slider {
  margin: 0 var(--spacing-md) var(--spacing-md);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.hot-section {
  margin-top: var(--spacing-sm);
}

.hot-section .section-header {
  margin-left: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

.more-link {
  font-size: 12px;
  color: var(--primary-color);
  text-decoration: none;
}

.slider-link {
  display: block;
  width: 100%;
  height: 100%;
}

.slider-img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  object-position: center bottom;
  display: block;
}

.category-section {
  margin: var(--spacing-md) 0;
  padding: 0 var(--spacing-md);
}

/* ========== 分类区域 - 一行四个，横向滑动 ========== */
.category-wrapper {
  display: flex;
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  gap: 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}

.category-wrapper::-webkit-scrollbar {
  display: none;
}

.category-item {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  transition: transform var(--transition-fast);
  scroll-snap-align: start;
}

.category-item:active {
  transform: scale(0.94);
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(255, 70, 78, 0.08) 0%, rgba(255, 138, 92, 0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  transition: all var(--transition-fast);
  color: var(--primary-color);
}

.category-icon img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.category-name {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

/* 推荐商品区域 */
.recommend-section {
  margin: var(--spacing-md);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: 0;
  margin: 0;
}

.product-grid li {
  list-style: none;
}

.product-card {
  display: block;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.product-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.img-wrapper {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.img-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: var(--spacing-sm);
}

.product-info .title {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
  min-height: 2.8em;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-xs);
}

.price {
  color: var(--danger-color);
  font-weight: 700;
  font-size: 16px;
}

.price::before {
  content: '¥';
  font-size: 12px;
  margin-right: 2px;
}

.buy-btn {
  font-size: 11px;
  color: white;
  background: var(--primary-gradient);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ========== 底部提示 ========== */
.bottom-tip {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-md);
  margin-top: var(--spacing-md);
}

.tip-text {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

/* ========== 回到顶部按钮 - 与商品列表页样式一致 ========== */
:deep(.van-back-top) {
  background: linear-gradient(135deg, #ff464e 0%, #ff8a5c 100%);
  box-shadow: 0 4px 16px rgba(255, 70, 78, 0.4);
  border-radius: 50%;
}

:deep(.van-back-top__icon) {
  color: white;
}

/* ========== 首屏骨架屏 ========== */
.home-skeleton {
  padding: 0 var(--spacing-md);
}

.sk-categories {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0 var(--spacing-md);
}

.sk-cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sk-banner {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow: hidden;
  height: 210px;
}

.sk-banner :deep(.van-skeleton-image) {
  height: 210px;
}

.sk-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.sk-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.sk-card-img {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-sm);
}
</style>
