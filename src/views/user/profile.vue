<!-- 
  @fileoverview 个人资料编辑组件
  @module components/business/profile
  @description 负责用户详细资料的修改与提交，包括头像上传、昵称、性别、地区、邮箱及密码修改，
               并提供退出登录功能，是用户信息管理的核心页面
  @requires stores/user
  @requires services/request
  @example
  // 路由配置: /business/profile (需要登录)
  <router-link to="/business/profile">编辑资料</router-link>
-->
<template>
  <div class="profile-page">
    <van-nav-bar title="个人信息" left-arrow @click-left="back" class="custom-nav" />

    <div class="profile-container">
      <van-form @submit="profile">
        <div class="avatar-section card-item">
          <div class="section-title">我的头像</div>
          <div class="uploader-wrapper">
            <van-uploader
              v-model="AvatarPreview"
              :max-count="1"
              reupload
              :deletable="false"
              :preview-full-image="true"
              class="custom-uploader"
            >
              <template #default>
                <div class="upload-btn">
                  <van-icon name="photograph" size="24" />
                  <span>更换头像</span>
                </div>
              </template>
            </van-uploader>
          </div>
        </div>

        <div class="info-section card-item">
          <div class="section-title">基本信息</div>
          <van-cell-group inset :border="false">
            <van-field
              v-model="business.nickname"
              name="nickname"
              label="昵称"
              placeholder="给自己取个好听的名字"
              :rules="rules.nickname"
            />
            <van-field
              v-model="business.sex_text"
              is-link
              readonly
              name="gender"
              label="性别"
              placeholder="选择性别"
              @click="GenderShow = true"
            />
            <van-field
              v-model="business.region_text"
              is-link
              readonly
              name="region"
              label="所在地区"
              placeholder="选择城市"
              @click="RegionShow = true"
            />
          </van-cell-group>
        </div>

        <div class="account-section card-item">
          <div class="section-title">账户与安全</div>
          <van-cell-group inset :border="false">
            <van-field
              :model-value="maskedMobile"
              readonly
              name="mobile"
              label="手机号码"
              placeholder="绑定手机号"
              class="readonly-field"
            />
            <van-field
              v-model="business.email"
              name="email"
              label="电子邮箱"
              placeholder="绑定邮箱"
              :rules="rules.email"
            />
            <van-field
              v-model="business.password"
              type="password"
              name="password"
              label="修改密码"
              placeholder="若不修改请留空"
            />
          </van-cell-group>
        </div>

        <div class="action-btn">
          <van-button round block type="primary" native-type="submit" :loading="submitting" :disabled="submitting">
            保存修改
          </van-button>
        </div>

        <div class="logout-btn-wrapper">
          <van-button round block plain type="danger" @click="logout">退出登录</van-button>
        </div>
      </van-form>
    </div>

    <van-popup v-model:show="GenderShow" position="bottom" round>
      <van-picker :columns="GenderList" @confirm="GenderConfirm" @cancel="GenderShow = false" />
    </van-popup>

    <van-popup v-model:show="RegionShow" position="bottom" round>
      <van-area :area-list="areaList" @confirm="RegionConfirm" @cancel="RegionShow = false" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { areaList } from '@vant/area-data'
import { UPLOAD } from '@/services/request'
import { isBizFail } from '@/utils/result'
import { useBack } from '@/hooks'
import { maskMobile } from '@/utils/mask'
import { getDisplayAvatarUrl } from '@/hooks/useAvatar'
import { EMAIL_PATTERN } from '@/utils/validate'

/** 个人资料表单数据（扩展 BusinessUserInfo 的表单编辑字段） */
interface ProfileForm {
  id?: number
  mobile?: string
  nickname?: string
  avatar?: string
  email?: string
  region_code?: string
  avatar_text?: string
  token?: string
  auth?: string
  gender?: string
  sex_text?: string
  region_text?: string
  password?: string
}

/** 下拉选项 */
interface PickerOption {
  text: string
  value: string
}

/** Picker/Area 确认事件参数 */
interface PickerConfirmParam {
  selectedOptions: PickerOption[]
}

/** 表单提交值 */
interface ProfileSubmitValues {
  nickname?: string
  email?: string
  password?: string
  avatar?: { file?: File }[]
}

const userStore = useUserStore()
const router = useRouter()
const submitting = ref(false)

const login = userStore.userInfo || {}
const business = reactive<ProfileForm>(login)

/** 退出登录 */
const logout = () => {
  showConfirmDialog({
    title: '退出提醒',
    message: '确定要退出当前账号吗？',
    confirmButtonColor: '#FF464E'
  })
    .then(() => {
      userStore.clearUserInfo()
      showSuccessToast('已安全退出')
      router.push('/login')
    })
    .catch(() => {})
}

const maskedMobile = maskMobile(business.mobile)

const back = useBack()

/** 表单验证规则 */
const rules = reactive({
  nickname: [{ required: true, message: '请输入昵称' }],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: EMAIL_PATTERN, message: '邮箱格式有误' }
  ]
})

/** 性别选择 */
const GenderShow = ref(false)
const GenderList = ref<PickerOption[]>([
  { text: '保密', value: '0' },
  { text: '男', value: '1' },
  { text: '女', value: '2' }
])

/** 性别确认选择 */
const GenderConfirm = ({ selectedOptions }: PickerConfirmParam) => {
  GenderShow.value = false
  business.gender = selectedOptions[0].value
  business.sex_text = selectedOptions[0].text
}

/** 地区选择 */
const RegionShow = ref(false)

/** 地区确认选择 */
const RegionConfirm = ({ selectedOptions }: PickerConfirmParam) => {
  RegionShow.value = false
  const [province, city, district] = selectedOptions
  business.region_code = district?.value ?? ''
  let region_text = ''
  if (province?.text) region_text += province.text
  if (city?.text) region_text += `/${city.text}`
  if (district?.text) region_text += `/${district.text}`
  business.region_text = region_text
}

/** 头像预览列表 */
const AvatarPreview = ref<{ url?: string }[]>([{ url: getDisplayAvatarUrl(business.avatar_text) }])

/** 提交保存 */
const profile = async (values: ProfileSubmitValues) => {
  if (submitting.value) return false

  const data: Record<string, unknown> = {
    id: business.id,
    mobile: business.mobile,
    nickname: values.nickname,
    email: values.email,
    gender: business.gender,
    region: business.region_code
  }

  if (values.password) data.password = values.password

  const avatar = values.avatar && values.avatar[0] ? values.avatar[0].file : null
  if (avatar) data.avatar = avatar

  submitting.value = true
  try {
    const result = await UPLOAD({ url: '/business/profile', params: data })
    if (isBizFail(result)) {
      showFailToast(result.msg || '保存失败')
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => {
        userStore.setUserInfo(result.data as ProfileForm)
        router.go(-1)
      }
    })
  } catch (error) {
    showFailToast('保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-page {
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

.profile-container {
  padding: 12px;
}

/* 卡片样式 */
.card-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.section-title {
  padding: 16px 16px 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--card-bg);
  border-bottom: 1px solid var(--bg-color);
}

/* 头像区域 - 横向布局 */
.avatar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

.avatar-section .section-title {
  padding: 0;
  border-bottom: none;
}

.uploader-wrapper {
  flex-shrink: 0;
}

:deep(.van-uploader__preview-image) {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: var(--bg-color);
  border-radius: 50%;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.upload-btn:active {
  transform: scale(0.95);
  background: #e8e8e8;
}

.upload-btn span {
  font-size: 11px;
  margin-top: 6px;
}

/* 表单项样式 */
:deep(.van-cell-group--inset) {
  margin: 0;
}

:deep(.van-cell) {
  padding: 14px 16px;
}

:deep(.van-cell:not(:last-child)) {
  border-bottom: 1px solid var(--bg-color);
}

:deep(.van-field__label) {
  width: 85px;
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.van-field__control) {
  text-align: left !important;
}

:deep(.van-field__control::placeholder) {
  color: var(--text-placeholder);
}

.readonly-field :deep(.van-field__control) {
  color: var(--text-secondary);
}

/* 保存按钮 */
.action-btn {
  margin-top: 32px;
  padding: 0 4px;
}

.logout-btn-wrapper {
  margin-top: 16px;
  padding: 0 4px;
}

:deep(.van-button--primary) {
  background: var(--primary-gradient);
  border: none;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

:deep(.van-button--primary:active) {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}
</style>
