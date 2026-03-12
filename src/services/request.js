// 引入axios异步请求插件，用于发送HTTP请求
import axios from 'axios'

// 定义两个变量：
// cancel: 用于存储取消请求的函数
// promiseArr: 用于存储每个请求的取消函数，key为请求的url
let cancel ,promiseArr = {}

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
      return config  // 返回配置，继续发送请求
}, error => {
    // 请求配置出错时的处理
    return Promise.reject(error)  // 将错误继续传递下去
})

/**
 * 响应拦截器
 * 处理服务器返回的响应和错误
 */
axios.interceptors.response.use(
  // 成功响应处理函数
  response => {
      // 直接返回响应中的数据部分，而不是整个响应对象
      return response.data
  }, 
  // 错误响应处理函数
  err => {
      // 判断错误对象是否有response属性（即服务器是否有返回错误信息）
      if (err && err.response) {
        // 根据HTTP状态码，设置对应的错误提示信息
        switch (err.response.status) {
          case 400:
            err.message = '错误请求'  // 客户端请求错误
            break;
          case 401:
            err.message = '未授权，请重新登录'  // 需要身份验证
            break;
          case 403:
            err.message = '拒绝访问'  // 服务器拒绝请求
            break;
          case 404:
            err.message = '请求错误,未找到该资源'  // 资源不存在
            break;
          case 405:
            err.message = '请求方法未允许'  // HTTP方法不被允许
            break;
          case 408:
            err.message = '请求超时'  // 请求超时
            break;
          case 500:
            err.message = '服务器端出错'  // 服务器内部错误
            break;
          case 501:
            err.message = '网络未实现'  // 服务器不支持请求的功能
            break;
          case 502:
            err.message = '网络错误'  // 网关错误
            break;
          case 503:
            err.message = '服务不可用'  // 服务暂时不可用
            break;
          case 504:
            err.message = '网络超时'  // 网关超时
            break;
          case 505:
            err.message = 'http版本不支持该请求'  // HTTP版本不支持
            break;
          default:
            // 其他未覆盖的状态码
            err.message = `连接错误${err.response.status}`
        }
      } else 
      {
        // 如果没有response属性，说明无法连接到服务器
        err.message = "连接到服务器失败"
      }
        // 在控制台输出错误信息
        console.error(err.message)
        // 返回一个已解决的Promise，包含错误响应
        return Promise.resolve(err.response)
  }
)

// 设置请求的基础URL，所有请求都会自动在前面加上'/shop'
axios.defaults.baseURL = '/shop'

// 设置默认请求头，标识这是一个异步请求
axios.defaults.headers = {
    'X-Requested-With': 'XMLHttpRequest'  // 表示这是一个ajax请求
}

// 设置请求超时时间，单位是毫秒，这里设置为10秒
axios.defaults.timeout = 10000

/**
 * GET请求方法
 * @param {Object} data - 包含url和params的对象
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let GET = (data = {}) => {
  return new Promise((resolve,reject) => {
    axios({
      method: 'get',  // 请求方法为GET
      url:data.url,   // 请求地址
      params: data.params,  // GET请求的参数，会拼接到URL后面
      cancelToken: new CancelToken(c => {
        cancel = c  // 保存取消函数到cancel变量
      })
    }).then(res => {
      resolve(res)  // 请求成功，将结果传递给Promise的resolve方法
    })
  })
}

/**
 * POST请求方法
 * @param {Object} data - 包含url和params的对象
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let POST = (data = {}) =>
{
  return new Promise((resolve,reject) => {
    axios({
      method: 'post',  // 请求方法为POST
      url:data.url,    // 请求地址
      data:data.params,  // POST请求的参数，放在请求体中
      cancelToken: new CancelToken(c => {
        cancel = c  // 保存取消函数到cancel变量
      })
    }).then(res => {
      resolve(res)  // 请求成功，将结果传递给Promise的resolve方法
    })
  })
}

/**
 * 文件上传请求方法
 * @param {Object} data - 包含url和params的对象，params包含文件数据和其他表单字段
 * @returns {Promise} 返回Promise对象，包含请求结果
 */
let UPLOAD = (data = {}) =>
{
  // 创建FormData对象，用于处理表单数据，特别是文件上传
  var RequestData = new FormData()

  // 判断是否有参数需要添加到表单数据中
  if(JSON.stringify(data.params) != "{}")
  {
    // 遍历params对象的所有属性，添加到FormData中
    for(var key in data.params)
    {
      RequestData.append(key, data.params[key])
    }
  }

  return new Promise((resolve,reject) => {
    axios({
      method: 'post',  // 文件上传使用POST方法
      url:data.url,    // 上传地址
      data:RequestData,  // FormData对象，包含文件和其他表单字段
      headers:{'Content-Type': 'multipart/form-data'},  // 设置请求头为表单数据格式
      cancelToken: new CancelToken(c => {
        cancel = c  // 保存取消函数到cancel变量
      })
    }).then(res => {
      resolve(res)  // 请求成功，将结果传递给Promise的resolve方法
    })
  })
}

// 导出封装的请求方法，供其他文件使用
export {
  GET,
  POST,
  UPLOAD
}