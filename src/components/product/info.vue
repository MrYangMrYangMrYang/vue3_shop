<template>
  <div class="product-info-page">
    <van-sticky>
      <!-- 导航栏 -->
      <van-nav-bar
        :title="product.name"
        left-arrow
        @click-left="back"
      >
        <template #right>
          <van-icon name="share-o" size="20" @click="ShareShow = true" />
        </template>
      </van-nav-bar>
    </van-sticky>

    <!-- 分享面板 -->
    <van-share-sheet
      v-model:show="ShareShow"
      title="立即分享"
      :options="options"
      @select="share"
    />

    <!-- 商品图片 - 固定比例 + 点击预览 -->
    <div class="banner" @click="previewImage">
      <img :src="product.thumbs_text" class="banner-img" />
    </div>

    <!-- 商品信息（不再使用负边距，不会压住图片） -->
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

    <!-- 商品参数/详情 -->
    <div class="detail-section">
      <div class="section-title">
        <span class="line"></span>
        <span class="text">商品详情</span>
        <span class="line"></span>
      </div>
      <div class="rich-content" v-html="product.content"></div>
    </div>

    <!-- 动作栏 -->
    <van-action-bar>
      <van-action-bar-icon icon="chat-o" text="客服" @click="contact" />
      <router-link to="/cart/index">
        <van-action-bar-icon icon="cart-o" text="购物车" :badge="count > 0 ? count : null" />
      </router-link>
      <van-action-bar-button 
        type="warning" 
        text="加入购物车" 
        @click="AddCart"
        class="btn-left"
      />
      <van-action-bar-button 
        type="danger" 
        text="立即购买" 
        @click="Buy"
        class="btn-right"
      />
    </van-action-bar>
  </div>
</template>

<script setup>
defineOptions({
  name: 'product-info'
})

import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast, showConfirmDialog, showImagePreview } from 'vant'
import { useCookies } from "vue3-cookies"

const router = useRouter()
const route = useRoute()
const { cookies } = useCookies()

// 获取用户信息
const login = cookies.get('business') ? cookies.get('business') : {}
const businessId = login.hasOwnProperty('id') ? login.id : 0

const productId = route.query.hasOwnProperty('proid') ? route.query.proid : 0
const product = ref({})
const count = ref(0)
const mobile = ref('')
const ShareShow = ref(false)
const cartId = ref('')

const options = [
  [
    { name: '微信', icon: 'wechat' },
    { name: '朋友圈', icon: 'wechat-moments' },
    { name: '微博', icon: 'weibo' },
    { name: 'QQ', icon: 'qq' },
  ],
  [
    { name: '复制链接', icon: 'link' },
    { name: '分享海报', icon: 'poster' },
    { name: '二维码', icon: 'qrcode' },
    { name: '小程序码', icon: 'weapp-qrcode' },
  ],
]

onBeforeMount(async () => {
  await ProductInfo()
})

const back = () => {
  router.go(-1)
}

// 商品信息
const ProductInfo = async () => {
  const result = await POST({
    url: '/index/info',
    params: {
      proid: productId,
      busid: businessId
    }
  })

  if (result.code == 0) {
    showFailToast({
      message: result.msg,
      onClose: () => {
        router.go(-1)
      }
    })
    return false
  }

  product.value = result.data.product
  count.value = result.data.count
  mobile.value = result.data.contact
}

// 图片预览
const previewImage = () => {
  if (product.value.thumbs_text) {
    showImagePreview([product.value.thumbs_text])
  }
}

// 拨打电话
const contact = async () => {
  showConfirmDialog({
    title: '拨打提醒',
    message: '是否确认拨打客服电话',
  })
  .then(() => {
    location.href = `tel:${mobile.value}`
  })
  .catch(() => {})
}

// 分享
const share = async (option) => {
  ShareShow.value = false
}

// 加入购物车
const AddCart = async () => {
  showConfirmDialog({
    title: '购物车提醒',
    message: '是否将该宝贝加入到购物车',
  })
  .then(async () => {
    if (!businessId) {
      showFailToast('请先登录')
      return false
    }

    const data = {
      busid: businessId,
      proid: productId
    }

    const result = await POST({
      url: '/cart/add',
      params: data
    })

    if (result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast(result.msg)
    await ProductInfo()
  })
  .catch(() => {})
}

// 立即购买
const Buy = () => {
  showConfirmDialog({
    title: '购买提醒',
    message: '是否立即购买该宝贝',
  })
  .then(async () => {
    if (!businessId) {
      showFailToast('请先登录')
      return false
    }

    const result = await POST({
      url: '/cart/buy',
      params: {
        busid: businessId,
        proid: productId,
      }
    })

    if (result.code == 0) {
      showFailToast({
        message: result.msg,
        onClose: () => {
          router.go(-1)
        },
      })
      return false
    }

    cartId.value = result.data

    router.push({
      path: '/cart/confirm',
      query: {
        cartids: cartId.value,
        action: 'buy'
      }
    })
  })
  .catch(() => {})
}
</script>

<style scoped>
.product-info-page {
  background: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 60px;
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
/* 关键修复：去掉 margin-top: -20px，彻底解决遮挡问题 */
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
  background: linear-gradient(135deg, #FFBE00 0%, #FF9500 100%) !important;
  border: none !important;
}

.btn-right {
  background: var(--primary-gradient) !important;
  border: none !important;
}
</style>