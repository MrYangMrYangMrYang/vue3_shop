<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="基本资料"
    left-text="返回"
    left-arrow
    @click-left="back"
  />

  <!-- 表单 -->
  <van-form @submit="profile">
    <van-cell-group inset>
      <!-- 手机号 -->
      <van-field
        v-model="business.mobile"
        readonly
        name="mobile"
        label="手机号码"
        placeholder="请输入手机号码"
        :rules="rules.mobile"
      />

      <!-- 昵称 -->
      <van-field
        v-model="business.nickname"
        name="nickname"
        label="昵称"
        placeholder="请输入昵称"
        :rules="rules.nickname"
      />

      <!-- 邮箱 -->
      <van-field
        v-model="business.email"
        name="email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <!-- 密码 -->
      <van-field
        v-model="business.password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="rules.password"
      />

      <!-- 性别 -->
      <van-field
        v-model="business.sex_text"
        is_link
        readonly
        name="gender"
        label="性别"
        placeholder="请点击选择性别"
        @click="GenderShow = true"
      />

      <!-- 弹出框 -->
      <van-popup v-model:show="GenderShow" position="bottom">
        <van-picker
          v-model="GenderDefault"
          :columns="GenderList"
          @confirm="GenderConfirm"
          @cancel="GenderShow = false"
        />
      </van-popup>
     
      <!-- 地区 -->
      <van-field
        v-model="business.region_text"
        is_link
        readonly
        name="region"
        label="所在地区"
        placeholder="请点击选择所在地区"
        @click="RegionShow = true"
      />

      <!-- 弹出框 -->
      <van-popup v-model:show="RegionShow" position="bottom">
        <van-area
          v-model="business.region_code"
          :area-list="areaList"
          @confirm="RegionConfirm"
          @cancel="RegionShow = false"
        />
      </van-popup>

      <!-- 头像上传 -->
      <van-field name="avatar" label="头像上传">
        <template #input>
          <van-uploader 
            v-model="AvatarPreview" 
            multiple
            :max-count="1"  
            />
        </template>
      </van-field>
         
    </van-cell-group>
      <div style="width:10rem;margin:20px auto 0px;">
      <van-button round block type="primary" native-type="submit" size="small">确认修改</van-button>
      </div>
  </van-form>
</template>

<script setup>
  import { useCookies } from "vue3-cookies";
  import {showSuccessToast, showFailToast, showConfirmDialog} from 'vant'
  import {useRouter} from 'vue-router'
  import {reactive, ref} from 'vue'
  import { areaList } from '@vant/area-data'
  import {POST, UPLOAD} from '@/services/request'

  //初始化
  const {cookies} = useCookies()
  const router = useRouter()

  //获取用户信息
  var login = cookies.get('business') ? cookies.get('business') : {};
  // console.log(login)
  const business = reactive(login)
  
  //返回上一页
  const back = () =>
  {
    router.go(-1)
  }

  //验证规则
  let rules = reactive({
    mobile: [
      {
        required: true,
        message: '请输入手机号码',
      },
      {
        pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
        message: '手机号码格式有误'
      }
    ],
    nickname: [
      {
        required: true,
        message: '请输入昵称',
      },
    ],
    email: [
      {
        required: true,
        message: '请输入邮箱',
      },
      {
        pattern: /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/,
        message: '邮箱格式有误'
      }
    ],
  })

  // 定义性别数据
  const GenderShow = ref(false)
  const GenderDefault = reactive([business.gender])
  const GenderList = reactive([
    {text: '保密', value: '0'},
    {text: '男', value: '1'},
    {text: '女', value: '2'},
  ])

  const GenderConfirm = ({selectedOptions}) => 
  {
    //确认后隐藏
    GenderShow.value = false
    // console.log(selectedOptions)
    //修改值
    business.gender = selectedOptions[0].value
    business.sex_text = selectedOptions[0].text
  }

  //地区数据
  // console.log(areaList)
  const RegionShow = ref(false)

  const RegionConfirm = ({selectedOptions}) => 
  {
    //确认后隐藏
    RegionShow.value = false
    // console.log(selectedOptions)
    const [province, city, district] = selectedOptions

    //修改地区码
    business.region_code = district.value

    //修改文字

    var region_text = ''

    if(province.text){

      region_text += province.text

    }

    if(city.text){

      region_text += `/${city.text}`
      
    }
    if(district.text){

      region_text += `/${district.text}`

    }
    business.region_text = region_text
  }

  //头像上传
  const AvatarPreview = ref([{
    url: business.avatar_text
  }
  ])

  //表单提交方法
  const profile = async (values) =>{
    // console.log(values)
    // console.log(business);

    //组装数据
    var data ={
      id: business.id,
      mobile: values.mobile,
      nickname: values.nickname,
      email: values.email,
      gender: business.gender,
      region: business.region_code,
    }

    //密码不为空就追加
    if(values.password){
      data.password = values.password
    }

    //有头像文件就添加
    var avatar = values.avatar[0].file

    if(avatar){
      data.avatar = avatar
    }

    //发起请求
    var result = await UPLOAD({
      url: '/business/profile',
      params: data
    })

    // console.log(result)

    if(result.code == 0)
    {
      showFailToast(result.msg)
      return false
    }

    showSuccessToast({
        message: result.msg,
        onClose: () => 
        {
            //存cookie，跳转
            cookies.set('business', result.data)

            //跳转
            router.go(-1)
        }
    })
    return false
  }
</script>


