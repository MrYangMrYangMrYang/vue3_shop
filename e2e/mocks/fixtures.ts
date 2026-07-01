/**
 * E2E Mock 数据：模拟后端 API 响应
 * 字段名严格对齐后端 /index/index 返回的数据结构
 */

export const HOME_RESPONSE = {
  code: 1,
  data: {
    typelist: [
      { id: 1, name: '沙发', thumb_text: 'https://picsum.photos/100/100?random=10' },
      { id: 2, name: '床垫', thumb_text: 'https://picsum.photos/100/100?random=11' },
      { id: 3, name: '桌椅', thumb_text: 'https://picsum.photos/100/100?random=12' },
      { id: 4, name: '灯具', thumb_text: 'https://picsum.photos/100/100?random=13' },
      { id: 5, name: '橱柜', thumb_text: 'https://picsum.photos/100/100?random=14' },
      { id: 6, name: '装饰', thumb_text: 'https://picsum.photos/100/100?random=15' }
    ],
    hots: [
      { id: 1, thumbs_text: 'https://picsum.photos/750/300?random=1' },
      { id: 2, thumbs_text: 'https://picsum.photos/750/300?random=2' },
      { id: 3, thumbs_text: 'https://picsum.photos/750/300?random=3' }
    ],
    recommend: [
      { id: 101, name: '北欧简约沙发', price: '2999', thumbs_text: 'https://picsum.photos/300/300?random=20' },
      { id: 102, name: '实木餐桌套装', price: '1599', thumbs_text: 'https://picsum.photos/300/300?random=21' },
      { id: 103, name: '轻奢真皮床', price: '4599', thumbs_text: 'https://picsum.photos/300/300?random=22' },
      { id: 104, name: '智能护眼台灯', price: '399', thumbs_text: 'https://picsum.photos/300/300?random=23' }
    ]
  }
}

export const PRODUCT_LIST_RESPONSE = {
  code: 1,
  data: {
    TypeName: '全部商品',
    list: [
      {
        id: 1,
        name: '北欧三人沙发 布艺可拆洗',
        price: 3299,
        origin_price: 4999,
        thumbs_text: 'https://picsum.photos/400/400?random=30',
        sales: 256,
        stock: 50
      },
      {
        id: 2,
        name: '日式简约双人床 1.8m',
        price: 2899,
        origin_price: 3999,
        thumbs_text: 'https://picsum.photos/400/400?random=31',
        sales: 189,
        stock: 32
      },
      {
        id: 3,
        name: '现代简约餐桌椅组合 一桌四椅',
        price: 1899,
        origin_price: 2599,
        thumbs_text: 'https://picsum.photos/400/400?random=32',
        sales: 320,
        stock: 78
      },
      {
        id: 4,
        name: '轻奢水晶吊灯 客厅卧室通用',
        price: 899,
        origin_price: 1299,
        thumbs_text: 'https://picsum.photos/400/400?random=33',
        sales: 445,
        stock: 120
      },
      {
        id: 5,
        name: '意式极简真皮沙发 头层牛皮',
        price: 6999,
        origin_price: 9999,
        thumbs_text: 'https://picsum.photos/400/400?random=34',
        sales: 67,
        stock: 15
      },
      {
        id: 6,
        name: '北欧实木书桌 带抽屉',
        price: 1299,
        origin_price: 1799,
        thumbs_text: 'https://picsum.photos/400/400?random=35',
        sales: 198,
        stock: 43
      }
    ]
  }
}

export const LOGIN_SUCCESS_RESPONSE = {
  code: 1,
  data: {
    business: {
      id: 1,
      mobile: '13800138000',
      nickname: '测试用户',
      avatar: '',
      email: '',
      token: 'mock_token_abc123'
    }
  }
}

export const LOGIN_FAIL_RESPONSE = {
  code: 0,
  msg: '手机号或密码错误'
}

export const LOGIN_CHECK_RESPONSE = {
  code: 1,
  data: {
    business: {
      id: 1,
      mobile: '13800138000',
      nickname: '测试用户',
      avatar: ''
    }
  }
}

export const NOT_LOGGED_IN_RESPONSE = {
  code: 0,
  msg: '未登录'
}
