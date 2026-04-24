<template>
  <div class="home-page" ref="homeContainer">
    <div class="topBox">
      <div class="logo">{{ site }}</div>
      <div class="search-wrapper">
        <van-search @search="search" v-model="keywords" placeholder="搜索商品..." shape="round" background="transparent" />
      </div>
    </div>

    <div class="category-section scroll-mode">
      <div class="category-wrapper">
        <router-link to="/product/list" class="category-item">
          <div class="category-icon">
            <van-icon name="apps-o" size="28" />
          </div>
          <span class="category-name">全部分类</span>
        </router-link>
        <router-link v-for="item in typelist" :key="item.id" :to="{path: '/product/list', query:{typeid: item.id}}" class="category-item">
          <div class="category-icon">
            <img :src="item.thumb_text" />
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
          <router-link :to="{path: '/product/info', query:{proid: item.id}}" class="slider-link">
            <img :src="item.thumbs_text" class="slider-img" />
          </router-link>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="recommend-section">
      <div class="section-header">
        <span class="section-title">好物推荐</span>
        <router-link to="/product/list" class="more-link">查看更多 ›</router-link>
      </div>
      <ul class="product-grid" ref="productGrid">
        <li v-for="(item, index) in recommend" :key="item.id">
          <router-link :to="{path: '/product/info', query:{proid: item.id}}" class="product-card">
            <div class="img-wrapper">
              <img :src="item.thumbs_text" />
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
      
      <!-- 底部提示 -->
      <div v-if="recommend.length > 0" class="bottom-tip">
        <span class="tip-text">— 没有更多了 —</span>
      </div>
    </div>

    <Menu />

    <!-- 回到顶部按钮 - 使用 Vant 组件，样式与商品列表页一致 -->
    <van-back-top right="20" bottom="70" />
  </div>
</template>

<script setup>
  defineOptions({
    name: 'home'
  })

  import {POST} from '@/services/request'
  import {useRouter} from 'vue-router'
  import {ref, onBeforeMount} from 'vue'
  import Menu from '@/components/common/Menu.vue'

  let typelist = ref([])
  let recommend = ref([])
  let hots = ref([])
  let site = ref('精品家居')
  let keywords = ref('')

  const router = useRouter()

  onBeforeMount(async () => {
    var result = await POST({
      url: '/index/index',
    })
    typelist.value = result.data.typelist
    recommend.value = result.data.recommend
    hots.value = result.data.hots
  })

  const search = async (value) => {
    keywords.value = value
    var result = await POST({
      url: '/index/index',
      params: {
        keywords: keywords.value
      }
    })
    router.push({
      path: '/product/list',
      query: {
        typeid: result.data.search.id
      }
    })
  }
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

.category-section.scroll-mode {
  margin: var(--spacing-md) 0;
  padding: 0 var(--spacing-md);
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

/* ========== 分类区域 - 横向滑动 ========== */
.category-wrapper {
  display: flex;
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  gap: var(--spacing-lg);
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.category-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.category-item {
  flex: 0 0 auto; /* 防止被压缩 */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.category-item:active {
  transform: scale(0.94);
}

/* 全部分类和其他分类样式统一 */
.category-icon {
  width: 56px;
  height: 56px;
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
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
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
  background: linear-gradient(135deg, #FF464E 0%, #FF8A5C 100%);
  box-shadow: 0 4px 16px rgba(255, 70, 78, 0.4);
  border-radius: 50%;
}

:deep(.van-back-top__icon) {
  color: white;
}
</style>