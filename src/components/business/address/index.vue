<!-- 
  @fileoverview 地址列表组件
  @module components/business/address/index
  @description 负责用户收货地址的管理展示，支持地址选择（下单流程）及地址的增删改入口，
               提供两种展示模式：普通管理模式与订单选择模式
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /business/address/index (需要登录)
  // 订单选择模式: ?action=order
  <router-link to="/business/address/index">收货地址</router-link>
-->
<template>
  <div class="address-page">
    <van-nav-bar
      title="我的收货地址"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="address-container">
      <div v-if="loading" class="skeleton-wrapper">
        <van-skeleton v-for="i in 3" :key="i" title :row="2" class="skeleton-card" />
      </div>

      <div
        v-else-if="list.length > 0 && actionType === 'order'"
        class="address-list-wrapper order-select-list"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="order-address-item"
          :class="{ 'order-address-item--active': String(item.id) === String(active) }"
          @click="handleOrderChoose(item)"
        >
          <div class="order-address-main">
            <div class="order-address-name-row">
              <span class="order-address-name">{{ item.name }}</span>
              <span class="order-address-tel">{{ item.tel }}</span>
              <span v-if="item.isDefault" class="order-default-tag">默认</span>
            </div>
            <div class="order-address-text">{{ item.address }}</div>
          </div>
          <van-icon
            name="edit"
            class="order-address-edit"
            @click.stop="edit(item)"
          />
        </div>
        <van-button round type="primary" class="bottom-button order-add-btn" @click="add">
          新增地址
        </van-button>
      </div>

      <div
        v-else-if="list.length > 0"
        class="address-list-wrapper"
      >
        <van-address-list
          v-model="active"
          :list="list"
          default-tag-text="默认"
          @add="add"
          @edit="edit"
          @select="actionType === 'order' ? order : select"
          @click-item="actionType === 'order' ? handleOrderClickItem : select"
          class="custom-address-list"
        />
      </div>
      
      <van-empty
        v-if="!loading && list.length === 0"
        image="network"
        description="暂无收货地址"
      >
        <van-button round type="primary" class="bottom-button" @click="add">
          新增地址
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<style scoped>
.address-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.custom-nav {
  background: var(--primary-gradient);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) {
  color: white !important;
}

.address-container {
  padding-top: 10px;
}

.skeleton-wrapper {
  padding: 0 12px;
}

.skeleton-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding: 16px;
}

:deep(.van-address-list) {
  padding: 0 12px;
  background: transparent;
}

:deep(.van-address-item) {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding: 4px 0;
  box-shadow: var(--shadow-sm);
}

:deep(.van-address-item__name) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.van-address-item__address) {
  color: var(--text-secondary);
  font-size: 13px;
}

:deep(.van-address-item__tag) {
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  padding: 2px 10px;
  font-size: 10px;
  color: white;
  border: none;
}

:deep(.van-address-item__edit) {
  color: var(--primary-color) !important;
}

:deep(.van-radio__icon--checked .van-icon) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.van-radio__icon--checked .van-icon--success) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.van-address-item .van-radio__icon) {
  display: none !important;
}

:deep(.van-address-list__bottom) {
  padding: 10px 16px;
  background: transparent;
  margin-bottom: 60px;
}

:deep(.van-empty) {
  padding: 60px 0;
}


.order-address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  margin: 0 12px var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.order-address-item--active {
  border: 1px solid rgba(255, 70, 78, 0.35);
}

.order-address-main {
  flex: 1;
  min-width: 0;
}

.order-address-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.order-address-name {
  font-weight: 600;
  color: var(--text-primary);
}

.order-address-tel {
  color: var(--text-secondary);
  font-size: 13px;
}

.order-default-tag {
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--primary-gradient);
  color: #fff;
  font-size: 10px;
}

.order-address-text {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.order-address-edit {
  margin-left: 12px;
  color: var(--primary-color);
  font-size: 18px;
}

.order-add-btn {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(env(safe-area-inset-bottom) + 12px);
  width: auto !important;
  margin: 0 !important;
  z-index: 20;
}

</style>

<!-- 不加 scoped，强制覆盖 primary 按钮样式 -->
<style>
/* 地址列表底部的新增按钮 - primary 类型 */
.van-address-list__bottom .van-button--primary,
.van-button--primary {
  background: linear-gradient(135deg, #FF464E 0%, #FF8A5C 100%) !important;
  border: none !important;
  border-radius: 30px !important;
  height: 44px !important;
  font-weight: 500 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(255, 70, 78, 0.2) !important;
}

.van-button--primary:active {
  transform: scale(0.98) !important;
  opacity: 0.9 !important;
}

/* 空状态的自定义按钮 */
.bottom-button {
  background: linear-gradient(135deg, #FF464E 0%, #FF8A5C 100%) !important;
  border: none !important;
  border-radius: 30px !important;
  color: white !important;
  font-weight: 500 !important;
  width: 160px !important;
  height: 44px !important;
}

.bottom-button:active {
  transform: scale(0.98) !important;
  opacity: 0.9 !important;
}
</style>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onBeforeMount, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { POST } from '@/services/request'
import { showSuccessToast, showFailToast } from 'vant'
import { getRouteQueryValue } from '@/utils/params'
import { isBizFail } from '@/utils/result'
import { useBack } from '@/hooks'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const business = userStore.userInfo || {}
const list = reactive([])
const active = ref('')
const loading = ref(true)
const handlingOrderSelect = ref(false)

const action = getRouteQueryValue(route.query, 'action', '')
const fromCartids = getRouteQueryValue(route.query, 'cartids', '')
const fromCheckoutAction = getRouteQueryValue(route.query, 'checkout_action', '')
const actionType = ref(action)

const back = useBack()

/** 新增地址（最多10个） */
const add = () => {
  if (list.length >= 10) { showFailToast('最多添加10个收货地址'); return }
  router.push('/business/address/add')
}

/** 编辑地址 */
const edit = (item) => { router.push({ path: '/business/address/edit', query: { id: item.id } }) }

/** 切换默认地址 */
const select = async (item, index) => {
  try {
    const data = { busid: business.id, id: item.id }
    const result = await POST({ url: '/address/toggle', params: data })
    if (isBizFail(result)) { showFailToast(result.msg); return false }

    active.value = item.id
    list.map((item) => { item.isDefault = false })
    list[index].isDefault = true
    showSuccessToast('已设为默认地址')
  } catch (error) {
    showFailToast('设置默认地址失败，请稍后重试')
  }
}

/** 下单场景：选择地址并跳转结算页 */
const order = async (item) => {
  if (handlingOrderSelect.value) return

  handlingOrderSelect.value = true
  try {
    const selectedItem = item?.id ? item : item?.item
    const selectedId = Number(selectedItem?.id) || selectedItem?.id
    if (!selectedId) { showFailToast('地址信息异常，请重新选择'); return }

    active.value = selectedId
    userStore.setSelectedAddressId(selectedId)
    userStore.setSelectedAddress({
      id: selectedId,
      name: selectedItem?.name || '',
      tel: selectedItem?.tel || '',
      address: selectedItem?.address || ''
    })

    await nextTick()
    await router.push({
      path: '/cart/confirm',
      query: {
        cartids: fromCartids,
        action: fromCheckoutAction,
        selected_addr_id: selectedId
      }
    })
  } finally {
    handlingOrderSelect.value = false
  }
}

const handleOrderClickItem = async (item) => {
  const selectedItem = item?.id ? item : item?.item
  if (!selectedItem?.id) return
  await order(selectedItem)
}

const handleOrderChoose = async (item) => { await order(item) }

/** 加载地址列表 */
onBeforeMount(async () => {
  loading.value = true
  try {
    const result = await POST({ url: '/address/index', params: { busid: business.id } })

    if (isBizFail(result) || !result.data || result.data.length <= 0) return false

    for (const item of result.data) {
      const status = item.status == '1'
      if (status) active.value = item.id
      list.push({
        id: item.id,
        name: item.consignee,
        tel: item.mobile,
        address: `${item.address_text} ${item.address}`,
        isDefault: status
      })
    }

    // 下单模式：恢复已选地址
    if (actionType.value === 'order' && userStore.selectedAddressId) {
      const selectedId = Number(userStore.selectedAddressId) || userStore.selectedAddressId
      const hasSelected = list.some(item => String(item.id) === String(selectedId))
      if (hasSelected) active.value = selectedId
    }
  } catch (error) {
    showFailToast('地址列表加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
})
</script>