<!-- 
  @fileoverview 商品详情组件
  @module components/product/info
  @description 负责展示商品完整信息：包括多图轮播、价格、库存、商品详情介绍（富文本），
               并提供加入购物车与立即购买功能，支持图片预览、分享面板、客服联系
  @requires stores/cart
  @requires services/request
  @example
  // 路由配置: /product/info?proid=123
  <router-link :to="{ path: '/product/info', query: { proid: 123 } }">查看详情</router-link>
-->
<template>
  <div class="product-info-page">
    <van-sticky>
      <van-nav-bar :title="product.name || '商品详情'" left-arrow @click-left="back">
        <template #right>
          <van-icon name="share-o" size="20" @click="ShareShow = true" />
        </template>
      </van-nav-bar>
    </van-sticky>

    <van-share-sheet v-model:show="ShareShow" title="立即分享" :options="options" @select="share" />

    <!-- 首屏骨架屏 -->
    <div v-if="loading" class="info-skeleton">
      <van-skeleton-image image-size="100%" class="sk-banner" />
      <div class="sk-info-card">
        <div class="sk-price">
          <van-skeleton-title title-width="40%" />
        </div>
        <!-- Vant 4 row-width 文档支持数组但 prop 类型仅限 string|number（已知 bug：vant-ui/vant#12041），用类型断言桥接；运行时警告由 main.ts warnHandler 过滤 -->
        <van-skeleton-paragraph :row-width="['100%', '80%', '60%'] as unknown as string" />
        <div class="sk-tags">
          <van-skeleton-title v-for="i in 3" :key="i" title-width="60px" />
        </div>
      </div>
      <div class="sk-detail">
        <van-skeleton-title title-width="30%" />
        <van-skeleton-paragraph :row-width="['100%', '100%', '90%', '70%'] as unknown as string" />
      </div>
    </div>

    <!-- 网络错误占位 -->
    <NetworkError v-else-if="hasError" @retry="retryProductInfo" />

    <template v-else>
      <div class="banner" @click="previewImage">
        <img v-lazy="product.thumbs_text" class="banner-img" :alt="product.name || '商品图片'" />
      </div>

      <div class="info-card">
        <div class="price-section">
          <span class="currency">¥</span>
          <span class="amount">{{ product.price }}</span>
          <div class="stock-tag">库存: {{ product.stock }} {{ product.unit ? product.unit.name : '' }}</div>
        </div>
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="service-tags">
          <van-tag plain type="primary" round>正品保证</van-tag>
          <van-tag plain type="primary" round>七天无理由</van-tag>
          <van-tag plain type="primary" round>极速退款</van-tag>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">
          <span class="line"></span>
          <span class="text">商品详情</span>
          <span class="line"></span>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="rich-content" v-html="sanitizedContent"></div>
      </div>

      <van-action-bar safe-area-inset-bottom>
        <van-action-bar-icon icon="chat-o" text="客服" @click="contact" />
        <router-link to="/cart/index">
          <van-action-bar-icon icon="cart-o" text="购物车" :badge="count > 0 ? count : ''" />
        </router-link>
        <van-action-bar-button type="warning" text="加入购物车" @click="AddCart" class="btn-left" />
        <van-action-bar-button type="danger" text="立即购买" @click="Buy" class="btn-right" />
      </van-action-bar>

      <!-- SKU 规格与数量选择弹窗 -->
      <SkuPanel v-model="skuVisible" :product="product" @confirm="onSkuConfirm" />
    </template>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProductInfo' })

import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount, computed } from 'vue'
import { POST } from '@/services/request'
import { showFailToast, showConfirmDialog, showImagePreview, showDialog, showToast } from 'vant'
import { useCartStore } from '@/stores/cart'
import { normalizeIdList, getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { useBack, useCartBadge, useBusid } from '@/hooks'
import DOMPurify from 'dompurify'
import NetworkError from '@/components/common/NetworkError.vue'
import SkuPanel from '@/components/product/SkuPanel.vue'
import { copyText } from '@/utils/clipboard'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const businessId = useBusid()

const productId = getRouteQueryValue(route.query, 'proid', 0)

/** 商品详情数据（后端 /index/info 返回的 product 字段） */
interface ProductDetail {
  id?: string | number
  name?: string
  thumbs_text?: string
  price?: string | number
  stock?: number | string
  unit?: { name?: string }
  content?: string
  specs?: { name: string; options: string[] }[]
  [key: string]: unknown
}

const product = ref<ProductDetail>({} as ProductDetail)
const loading = ref(true)
const hasError = ref(false)
const count = useCartBadge()

/** 商品详情富文本（XSS 净化） */
const sanitizedContent = computed(() => DOMPurify.sanitize(product.value.content || ''))
const mobile = ref('')
const ShareShow = ref(false)
const cartId = ref('')
const skuVisible = ref(false)
const skuAction = ref('')

const options = [
  [
    { name: '微信', icon: 'wechat' },
    { name: '朋友圈', icon: 'wechat-moments' },
    { name: '微博', icon: 'weibo' },
    { name: 'QQ', icon: 'qq' }
  ],
  [
    { name: '复制链接', icon: 'link' },
    { name: '分享海报', icon: 'poster' },
    { name: '二维码', icon: 'qrcode' },
    { name: '小程序码', icon: 'weapp-qrcode' }
  ]
]

onBeforeMount(async () => {
  await ProductInfo()
})

const back = useBack()

/** 加载商品详情 */
const ProductInfo = async () => {
  hasError.value = false
  try {
    const result = await POST({
      url: '/index/info',
      params: { proid: productId, busid: businessId }
    })

    if (isBizFail(result) || !result.data || !(result.data as Record<string, unknown>).product) {
      showFailToast({
        message: result.msg || '商品信息加载失败',
        onClose: () => {
          router.go(-1)
        }
      })
      return false
    }

    const data = result.data as { product: Record<string, unknown>; count?: number; contact?: string }
    product.value = data.product as ProductDetail
    cartStore.setCount(data.count || 0)
    mobile.value = data.contact || ''
  } catch (error) {
    hasError.value = true
  } finally {
    loading.value = false
  }
}

/** 重试加载商品详情 */
const retryProductInfo = () => {
  loading.value = true
  ProductInfo()
}

/** 图片预览 */
const previewImage = () => {
  if (product.value.thumbs_text) showImagePreview([product.value.thumbs_text])
}

/** 拨打客服电话 */
const contact = async () => {
  showConfirmDialog({
    title: '拨打提醒',
    message: '是否确认拨打客服电话',
    confirmButtonColor: '#FF464E'
  })
    .then(() => {
      location.href = `tel:${mobile.value}`
    })
    .catch(() => {})
}

/** 分享商品：复制链接直接写剪贴板，社交平台优先 Web Share API（不支持则降级复制链接），海报/二维码类提示开发中 */
const share = async (option: { name: string }) => {
  ShareShow.value = false
  const shareData = {
    title: product.value.name || '商品详情',
    text: product.value.name || '精品好物推荐',
    url: window.location.href
  }

  if (option.name === '复制链接') {
    await copyText(shareData.url)
    return
  }

  if (['分享海报', '二维码', '小程序码'].includes(option.name)) {
    showToast('该功能开发中')
    return
  }

  // 微信/朋友圈/微博/QQ：优先调用系统级分享面板
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      // 用户取消分享，无需处理
    }
  } else {
    await copyText(shareData.url, { emptyMessage: '分享链接生成失败' })
    showToast('链接已复制，去粘贴给好友吧')
  }
}

/** 加入购物车 - 打开 SKU 选择面板 */
const AddCart = () => {
  if (!businessId) {
    showFailToast('请先登录')
    return false
  }
  skuAction.value = 'cart'
  skuVisible.value = true
}

/** 立即购买 - 打开 SKU 选择面板 */
const Buy = () => {
  if (!businessId) {
    showFailToast('请先登录')
    return false
  }
  skuAction.value = 'buy'
  skuVisible.value = true
}

/** SKU 选择确认后，根据动作执行加购或购买 */
const onSkuConfirm = async ({ quantity }: { quantity: number }) => {
  if (skuAction.value === 'cart') await doAddCart(quantity)
  else await doBuy(quantity)
}

/** 执行加入购物车 */
const doAddCart = async (nums: number) => {
  try {
    const data = { busid: businessId, proid: productId, nums }
    const result = await POST({ url: '/cart/add', params: data })

    if (isBizFail(result)) {
      showFailToast(result.msg || '加入购物车失败')
      return false
    }

    showDialog({
      title: '操作成功',
      message: '宝贝已成功加入购物车',
      className: 'cart-success-dialog',
      confirmButtonColor: '#FF464E',
      confirmButtonText: '去购物车',
      showCancelButton: true,
      cancelButtonText: '再看看'
    }).then(action => {
      if (action === 'confirm') router.push('/cart/index')
    })

    await cartStore.updateCount(businessId)
  } catch (error) {
    showFailToast('加入购物车失败，请稍后重试')
  }
}

/** 执行立即购买（创建临时购物车记录并跳转结算） */
const doBuy = async (nums: number) => {
  try {
    const result = await POST({
      url: '/cart/buy',
      params: { busid: businessId, proid: productId, nums }
    })

    if (isBizFail(result)) {
      showFailToast({
        message: result.msg,
        onClose: () => {
          router.go(-1)
        }
      })
      return false
    }

    if (!result.data) {
      showFailToast('购买信息异常，请稍后重试')
      return false
    }

    cartId.value = result.data as string

    router.push({
      path: '/cart/confirm',
      query: { cartids: normalizeIdList(cartId.value), action: 'buy' }
    })
  } catch (error) {
    showFailToast('购买失败，请稍后重试')
  }
}
</script>

<style scoped>
.product-info-page {
  background: var(--bg-color);
  min-height: 100vh;
  /* 60px 为 action-bar 高度，加 safe-area 补偿底部安全区 */
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

:deep(.van-nav-bar) {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar__text),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

/* ========== 商品图片 - 固定比例 + 不裁剪图片内容 ========== */
.banner {
  width: 100%;
  background: white;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
  display: block;
}

/* ========== 商品信息卡片 ========== */
.info-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 20px var(--spacing-md) 24px;
  position: relative;
  box-shadow: var(--shadow-sm);
  margin-top: 0;
}

.price-section {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.currency {
  font-size: 16px;
  color: var(--primary-color);
  font-weight: 700;
}

.amount {
  font-size: 32px;
  color: var(--primary-color);
  font-weight: 800;
}

.stock-tag {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-color);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0 0 12px 0;
  word-break: break-word;
}

/* 服务标签 */
.service-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

:deep(.van-tag--primary.van-tag--plain) {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(255, 70, 78, 0.06);
  padding: 6px 12px;
}

/* 商品详情区域 */
.detail-section {
  background: var(--card-bg);
  margin-top: 12px;
  padding: 20px var(--spacing-md);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title .text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-title .line {
  width: 40px;
  height: 2px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

/* 富文本内容 */
.rich-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
  word-break: break-word;
  overflow-wrap: break-word;
}

.rich-content p {
  margin-bottom: 12px;
}

:deep(.rich-content img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 16px 0;
  border-radius: var(--radius-md);
}

/* 底部操作栏 */
:deep(.van-action-bar) {
  gap: 12px;
  padding: 8px 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  height: auto;
}

:deep(.van-action-bar-icon) {
  flex-shrink: 0;
}

.btn-left,
.btn-right {
  flex: 1;
  border-radius: 30px !important;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
}

.btn-left {
  background: linear-gradient(135deg, #ffbe00 0%, #ff9500 100%) !important;
  border: none !important;
}

.btn-right {
  background: var(--primary-gradient) !important;
  border: none !important;
}

:deep(.cart-success-dialog .van-dialog__footer .van-button) {
  background: transparent !important;
  border: none !important;
}

:deep(.cart-success-dialog .van-dialog__cancel) {
  color: var(--text-secondary) !important;
  font-weight: 500;
}

:deep(.cart-success-dialog .van-dialog__confirm) {
  color: var(--primary-color) !important;
  font-weight: 600;
}

/* ========== 首屏骨架屏 ========== */
.info-skeleton {
  background: var(--bg-color);
}

.info-skeleton .sk-banner {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: block;
}

.info-skeleton .sk-banner :deep(.van-skeleton-image) {
  width: 100%;
  height: 100%;
}

.sk-info-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 20px var(--spacing-md) 24px;
  margin-top: -16px;
  position: relative;
  z-index: 1;
}

.sk-price {
  margin-bottom: 16px;
}

.sk-tags {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.sk-detail {
  background: var(--card-bg);
  margin-top: 12px;
  padding: 20px var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
