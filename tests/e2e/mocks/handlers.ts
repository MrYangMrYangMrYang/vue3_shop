/**
 * E2E API Mock 拦截器
 * 使用 Playwright page.route() 拦截所有 /shop/* 请求并返回 mock 数据
 */
import type { Page } from '@playwright/test'
import {
  HOME_RESPONSE,
  PRODUCT_LIST_RESPONSE,
  PRODUCT_INFO_RESPONSE,
  LOGIN_SUCCESS_RESPONSE,
  LOGIN_CHECK_RESPONSE,
  NOT_LOGGED_IN_RESPONSE,
  CART_ADD_RESPONSE,
  CART_LIST_RESPONSE,
  ADDRESS_LIST_RESPONSE,
  ORDER_CREATE_RESPONSE,
  ORDER_LIST_RESPONSE,
  CART_DELBUY_RESPONSE
} from './fixtures'

/**
 * 为页面注入 mock API（游客模式：未登录浏览商城）
 */
export async function setupGuestUser(page: Page): Promise<void> {
  await page.route('**/shop/**', async route => {
    const url = route.request().url()

    if (url.includes('/index/index')) {
      return route.fulfill({ json: HOME_RESPONSE })
    }

    if (url.includes('/index/list')) {
      return route.fulfill({ json: PRODUCT_LIST_RESPONSE })
    }

    // 分类筛选项
    if (url.includes('/index/type')) {
      return route.fulfill({
        json: {
          code: 1,
          data: {
            data: [
              { id: 1, name: '沙发' },
              { id: 2, name: '床垫' },
              { id: 3, name: '桌椅' }
            ]
          }
        }
      })
    }

    if (url.includes('/business/check')) {
      return route.fulfill({ json: NOT_LOGGED_IN_RESPONSE })
    }

    if (url.includes('/business/login')) {
      return route.fulfill({ json: LOGIN_SUCCESS_RESPONSE })
    }

    // 未匹配的 API 返回空数据（避免页面崩溃）
    return route.fulfill({ json: { code: 1, data: {} } })
  })
}

/**
 * 模拟已登录用户
 */
export async function setupLoggedInUser(page: Page): Promise<void> {
  await page.route('**/shop/**', async route => {
    const url = route.request().url()

    if (url.includes('/business/check')) {
      return route.fulfill({ json: LOGIN_CHECK_RESPONSE })
    }

    if (url.includes('/business/login')) {
      return route.fulfill({ json: LOGIN_SUCCESS_RESPONSE })
    }

    if (url.includes('/index/index')) {
      return route.fulfill({ json: HOME_RESPONSE })
    }

    if (url.includes('/index/list')) {
      return route.fulfill({ json: PRODUCT_LIST_RESPONSE })
    }

    if (url.includes('/index/info')) {
      return route.fulfill({ json: PRODUCT_INFO_RESPONSE })
    }

    if (url.includes('/cart/add')) {
      return route.fulfill({ json: CART_ADD_RESPONSE })
    }

    if (url.includes('/cart/index')) {
      return route.fulfill({ json: CART_LIST_RESPONSE })
    }

    if (url.includes('/cart/delbuy')) {
      return route.fulfill({ json: CART_DELBUY_RESPONSE })
    }

    if (url.includes('/address/index')) {
      return route.fulfill({ json: ADDRESS_LIST_RESPONSE })
    }

    if (url.includes('/address/order')) {
      return route.fulfill({ json: ADDRESS_LIST_RESPONSE })
    }

    if (url.includes('/order/create')) {
      return route.fulfill({ json: ORDER_CREATE_RESPONSE })
    }

    if (url.includes('/order/index')) {
      return route.fulfill({ json: ORDER_LIST_RESPONSE })
    }

    return route.fulfill({ json: { code: 1, data: {} } })
  })
}
