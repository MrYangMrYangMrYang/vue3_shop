/** 订单状态码 */
const ORDER_STATUS = {
  ALL: '0',
  PENDING_PAYMENT: '-2',
  PENDING_SHIP: '1',
  PENDING_RECEIVE: '2',
  PENDING_REVIEW: '3',
  COMPLETED: '4',
  AFTER_SALE: '-1',
  CANCELLED: '-3'
}

/** 状态码到中文的映射 */
const ORDER_STATUS_MAP = {
  [ORDER_STATUS.ALL]: '全部',
  [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
  [ORDER_STATUS.PENDING_SHIP]: '待发货',
  [ORDER_STATUS.PENDING_RECEIVE]: '待收货',
  [ORDER_STATUS.PENDING_REVIEW]: '待评价',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.AFTER_SALE]: '售后',
  [ORDER_STATUS.CANCELLED]: '已取消'
}

/** 支付超时时间：30分钟 */
const ORDER_PAYMENT_TIMEOUT_MS = 30 * 60 * 1000

/**
 * 获取状态文本
 * @param {string|number} status
 * @returns {string}
 */
const getOrderStatusText = (status) => ORDER_STATUS_MAP[String(status)] || '未知状态'

/**
 * 获取状态对应的 CSS 类名
 * @param {string|number} status
 * @returns {string}
 */
const getOrderStatusClass = (status) => {
  const statusStr = String(status)
  if (statusStr === '-1') return 'status--1'
  if (statusStr === '-2') return 'status--2'
  if (statusStr === '-3') return 'status--3'
  return `status-${statusStr}`
}

/** 判断是否为待支付状态 */
const isPendingPayment = (status) => String(status) === ORDER_STATUS.PENDING_PAYMENT

/** 判断是否为已取消状态 */
const isCancelled = (status) => String(status) === ORDER_STATUS.CANCELLED

export {
  ORDER_STATUS,
  ORDER_STATUS_MAP,
  ORDER_PAYMENT_TIMEOUT_MS,
  getOrderStatusText,
  getOrderStatusClass,
  isPendingPayment,
  isCancelled
}
