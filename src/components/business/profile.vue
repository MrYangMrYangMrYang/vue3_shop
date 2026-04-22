<template>
  <div class="profile-page">
    <van-nav-bar
      title="个人信息"
      left-arrow
      @click-left="back"
      class="custom-nav"
    />

    <div class="profile-container">
      <van-form @submit="profile">
        <!-- 头像区域 - 横向布局 -->
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

        <!-- 基本信息 -->
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

        <!-- 账户与安全 -->
        <div class="account-section card-item">
          <div class="section-title">账户与安全</div>
          <van-cell-group inset :border="false">
            <van-field
              v-model="business.mobile"
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

        <!-- 保存按钮 -->
        <div class="action-btn">
          <van-button round block type="primary" native-type="submit">
            保存修改
          </van-button>
        </div>

        <!-- 退出登录 -->
        <div class="logout-btn">
          <van-button round block class="logout-button" @click="handleLogout">
            退出登录
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 性别选择弹窗 -->
    <van-popup v-model:show="GenderShow" position="bottom" round>
      <van-picker
        :columns="GenderList"
        @confirm="GenderConfirm"
        @cancel="GenderShow = false"
      />
    </van-popup>

    <!-- 地区选择弹窗 -->
    <van-popup v-model:show="RegionShow" position="bottom" round>
      <van-area
        :area-list="areaList"
        @confirm="RegionConfirm"
        @cancel="RegionShow = false"
      />
    </van-popup>
  </div>
</template>

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
  padding: 0 16px;
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

/* 退出登录按钮 */
.logout-btn {
  margin-top: 20px;
  padding: 0 16px 30px;
}

.logout-button {
  background: transparent !important;
  border: 1px solid var(--danger-color) !important;
  color: var(--danger-color) !important;
  height: 46px;
  font-size: 15px;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.logout-button:active {
  background: rgba(255, 70, 78, 0.05) !important;
  transform: scale(0.98);
}
</style>

<script setup>
  import { useCookies } from "vue3-cookies";
  import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
  import { useRouter } from 'vue-router'
  import { reactive, ref } from 'vue'
  import { areaList } from '@vant/area-data'
  import { POST, UPLOAD } from '@/services/request'

  const { cookies } = useCookies()
  const router = useRouter()

  var login = cookies.get('business') ? cookies.get('business') : {};
  const business = reactive(login)
  
  const back = () => {
    router.go(-1)
  }

  // 验证规则
  let rules = reactive({
    nickname: [
      { required: true, message: '请输入昵称' },
    ],
    email: [
      { required: true, message: '请输入邮箱' },
      { pattern: /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/, message: '邮箱格式有误' }
    ],
  })

  // 性别
  const GenderShow = ref(false)
  const GenderList = ref([
    { text: '保密', value: '0' },
    { text: '男', value: '1' },
    { text: '女', value: '2' },
  ])

  const GenderConfirm = ({ selectedOptions }) => {
    GenderShow.value = false
    business.gender = selectedOptions[0].value
    business.sex_text = selectedOptions[0].text
  }

  // 地区
  const RegionShow = ref(false)

  const RegionConfirm = ({ selectedOptions }) => {
    RegionShow.value = false
    const [province, city, district] = selectedOptions
    business.region_code = district.value
    let region_text = ''
    if (province.text) region_text += province.text
    if (city.text) region_text += `/${city.text}`
    if (district.text) region_text += `/${district.text}`
    business.region_text = region_text
  }

  // 头像
  const AvatarPreview = ref([{ url: business.avatar_text }])

  // 退出登录
  const handleLogout = () => {
    showConfirmDialog({
      title: '退出登录',
      message: '确定要退出登录吗？',
    })
    .then(() => {
      cookies.remove('business')
      router.replace('/login')
    })
    .catch(() => {})
  }

  // 保存表单
  const profile = async (values) => {
    var data = {
      id: business.id,
      mobile: values.mobile,
      nickname: values.nickname,
      email: values.email,
      gender: business.gender,
      region: business.region_code,
    }

    if (values.password) {
      data.password = values.password
    }

    var avatar = values.avatar && values.avatar[0] ? values.avatar[0].file : null
    if (avatar) {
      data.avatar = avatar
    }

    var result = await UPLOAD({
      url: '/business/profile',
      params: data
    })

    if (result.code == 0) {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
      message: result.msg,
      onClose: () => {
        cookies.set('business', result.data)
        router.go(-1)
      }
    })
  }
</script>