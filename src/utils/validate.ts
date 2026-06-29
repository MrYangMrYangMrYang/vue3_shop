/**
 * @module utils/validate
 * @description 表单校验工具集：集中维护手机号/邮箱/密码/验证码等正则与校验函数，
 *              替代业务组件里散落重复的正则字面量
 */

/** 手机号（中国大陆 11 位） */
const MOBILE_PATTERN = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/

/** 邮箱 */
const EMAIL_PATTERN = /^([A-Za-z0-9_.\u4e00-\u9fa5-])+@([A-Za-z0-9_.-])+\.([A-Za-z]{2,8})$/

/** 短信验证码（6 位数字） */
const SMS_CODE_PATTERN = /^\d{6}$/

/** 密码：6 位以上 */
const PASSWORD_PATTERN = /.{6,}/

/** 是否为合法手机号 */
const isMobile = (value: unknown): boolean => MOBILE_PATTERN.test(String(value || '').trim())

/** 是否为合法邮箱 */
const isEmail = (value: unknown): boolean => EMAIL_PATTERN.test(String(value || '').trim())

/** 是否为合法短信验证码 */
const isSmsCode = (value: unknown): boolean => SMS_CODE_PATTERN.test(String(value || '').trim())

/** 是否为合法密码（6 位以上） */
const isPassword = (value: unknown): boolean => PASSWORD_PATTERN.test(String(value || ''))

export { MOBILE_PATTERN, EMAIL_PATTERN, SMS_CODE_PATTERN, PASSWORD_PATTERN, isMobile, isEmail, isSmsCode, isPassword }
