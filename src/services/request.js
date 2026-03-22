// 引入axios异步请求插件，用于发送HTTP请求
import axios from 'axios'

// 定义两个变量：
// cancel: 用于存储取消请求的函数
// promiseArr: 用于存储每个请求的取消函数，key为请求的url
let cancel, promiseArr = {}

// 从axios中引入CancelToken，用于创建取消请求的token
const CancelToken = axios.CancelToken;

/**
 * 请求拦截器
 * 在发送请求之前执行，用于处理相同请求的取消逻辑
 */
axios.interceptors.request.use(config => {
  // 发起请求时，检查当前url是否已有正在进行的请求
  if (promiseArr[config.url]) {
    // 如果有相同的请求正在进行，则取消之前的请求
    // 执行存储的取消函数，并传入取消的原因
    promiseArr[config.url]('操作取消')
    // 将当前的取消函数更新到promiseArr中
    promiseArr[config.url] = cancel
  } else {
    // 如果没有相同的请求，直接将当前的取消函数存储起来
    promiseArr[config.url] = cancel
  }
  return config
}, error => {
  // 请求配置出错时的处理
  return Promise.reject(error)
})

/**
 * 递归处理对象或数组中的所有图片字段
 * @param {Object|Array} data - 要处理的数据
 * @returns {Object|Array} 处理后的数据
 */
function processImages(data) {
  if (!data || typeof data !== 'object') return data

  // 如果是数组，遍历每个元素
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      data[index] = processImages(item)
    })
    return data
  }

  // 如果是对象，遍历所有属性
  Object.keys(data).forEach(key => {
    const value = data[key]

    // 如果是字符串且包含本地域名，处理图片字段
    if (typeof value === 'string') {
      // 判断是否是图片相关字段
      const imageFields = ['image', 'images', 'avatar', 'thumb', 'icon', 'logo', 'pic', 'photo', 'cover', 'img']
      if (imageFields.includes(key) || key.includes('image') || key.includes('img') || key.includes('icon')) {
        if (value.includes('www.fastadmin.com')) {
          data[key] = value.replace('http://www.fastadmin.com', '')
        }
      } else {
        // 非图片字段也可能包含图片URL（如富文本内容中的图片）
        if (value.includes('www.fastadmin.com') && (value.includes('.jpg') || value.includes('.png') || value.includes('.gif') || value.includes('.jpeg'))) {
          data[key] = value.replace(/http:\/\/www\.fastadmin\.com/g, '')
        }
      }
    }

    // 如果是数组或对象，递归处理
    if (value && typeof value === 'object') {
      data[key] = processImages(value)
    }
  })

  return data
}

/**
 * 响应拦截器
 * 处理服务器返回的响应和错误
 */
axios.interceptors.response.use(
  // 成功响应处理函数
  response => {
    const resData = response.data

    // 判断是否是本地开发环境（通过域名判断）
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    // 只在生产环境（非本地）处理图片路径
    if (!isLocal && resData && resData.data) {
      resData.data = processImages(resData.data)
    }

    // 直接返回响应中的数据部分
    return resData
  },
  // 错误响应处理函数
  err => {
    // 判断错误对象是否有response属性（即服务器是否有返回错误信息）
    if (err && err.response) {
      // 根据HTTP状态码，设置对应的错误提示信息
      switch (err.response.status) {
        case 400:
          err.message = '错误请求'
          break;
        case 401:
          err.message = '未授权，请重新登录'
          break;
        case 403:
          err.message = '拒绝访问'
          break;
        case 404:
          err.message = '请求错误,未找到该资源'
          break;
        case 405:
          err.message = '请求方法未允许'
          break;
        case 408:
          err.message = '请求超时'
          break;
        case 500:
          err.message = '服务器端出错'
          break;
        case 501:
          err.message = '网络未实现'
          break;
        case 502:
          err.message = '网络错误'
          break;
        case 503:
          err.message = '服务不可用'
          break;
        case 504:
          err.message = '网络超时'
          break;
        case 505:
          err.message = 'http版本不支持该请求'
          break;
        default:
          err.message = `连接错误${err.response.status}`
      }
    } else {
      // 如果没有response属性，说明无法连接到服务器
      err.message = "连接到服务器失败"
    }
    // 在控制台输出错误信息
    console.error(err.message)
    // 返回一个已解决的Promise，包含错误响应
    return Promise.resolve(err.response)
  }
)

// ========== 关键修改：统一使用相对路径 ==========
// 开发环境：通过 Vite 代理转发
// 生产环境：通过 Nginx 代理转发
axios.defaults.baseURL = '/shop'

// 设置默认请求头，标识这是一个异步请求
axios.defaults.headers = {
  'X-Requested-With': 'XMLHttpRequest'
}

// 设置请求超时时间，单位是毫秒，这里设置为10秒
axios.defaults.timeout = 10000

/**
 * GET请求方法
 * @param {Object} data - 包含url和params的对象
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let GET = (data = {}) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: data.url,
      params: data.params,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    }).then(res => {
      resolve(res)
    })
  })
}

/**
 * POST请求方法
 * @param {Object} data - 包含url和params的对象
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let POST = (data = {}) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: data.url,
      data: data.params,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    }).then(res => {
      resolve(res)
    })
  })
}

/**
 * 文件上传请求方法
 * @param {Object} data - 包含url和params的对象，params包含文件数据和其他表单字段
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let UPLOAD = (data = {}) => {
  // 创建FormData对象，用于处理表单数据，特别是文件上传
  var RequestData = new FormData()

  // 判断是否有参数需要添加到表单数据中
  if (JSON.stringify(data.params) != "{}") {
    // 遍历params对象的所有属性，添加到FormData中
    for (var key in data.params) {
      RequestData.append(key, data.params[key])
    }
  }

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: data.url,
      data: RequestData,
      headers: { 'Content-Type': 'multipart/form-data' },
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    }).then(res => {
      resolve(res)
    })
  })
}

// 导出封装的请求方法，供其他文件使用
export {
  GET,
  POST,
  UPLOAD
}