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

      <van-address-list
        v-else
        v-model="active"
        :list="list"
        default-tag-text="默认"
        @add="add"
        @edit="edit"
        @select="actionType === 'order' ? order : select"
        class="custom-address-list"
      />
      
      <van-empty
        v-if="!loading && list.length === 0"
        description="暂无收货地址"
        image="network"
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

:deep(.van-address-list__bottom) {
  padding: 10px 16px;
  background: transparent;
  margin-bottom: 60px;
}

:deep(.van-empty) {
  padding: 60px 0;
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
  import {useRouter, useRoute} from 'vue-router'
  import {reactive, ref, onBeforeMount} from 'vue'
  import { useCookies } from "vue3-cookies";
  import {POST} from '@/services/request'
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'

  const {cookies} = useCookies()
  const router = useRouter()
  const route = useRoute()

  const business = cookies.get('business') ? cookies.get('business') : {}
  const list = reactive([])
  const active = ref('')
  const loading = ref(true)
  
  const action = route.query.hasOwnProperty('action') ? route.query.action : ''
  const actionType = ref(action)

  const back = () => {
    router.go(-1)
  }

  const add = () => {
    if (list.length >= 10) {
      showFailToast('最多添加10个收货地址')
      return
    }
    router.push('/business/address/add')
  }

  const edit = (item) => {
    router.push({path: '/business/address/edit', query:{id: item.id}})
  }

  const select = async (item, index) => {
    const data = { busid: business.id, id: item.id }
    const result = await POST({ url: '/address/toggle', params: data })

    if (result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    active.value = item.id
    list.map((item) => { item.isDefault = false })
    list[index].isDefault = true
    showSuccessToast('已设为默认地址')
  }

  const order = async (item) => {
    cookies.set('address', item.id)
    router.go(-1)
  }

  onBeforeMount(async () => {
    loading.value = true
    const result = await POST({
      url: '/address/index',
      params: { busid: business.id }
    })

    if (result.code == 0 || !result.data || result.data.length <= 0) {
      loading.value = false
      return false
    }

    for (const item of result.data) {
      const status = item.status == '1'
      if (status) {
        active.value = item.id
      }
      list.push({
        id: item.id,
        name: item.consignee,
        tel: item.mobile,
        address: `${item.address_text} ${item.address}`,
        isDefault: status
      })
    }
    loading.value = false
  })
</script>