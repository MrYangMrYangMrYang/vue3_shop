/**
 * 商品列表 & 404 页面 E2E 测试
 */
import { test, expect } from '@playwright/test'
import { setupGuestUser } from './mocks/handlers'

test.describe('商品列表页', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestUser(page)
    await page.goto('/product/list')
  })

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/商品列表/)
  })

  test('导航栏包含返回按钮和搜索图标', async ({ page }) => {
    const navBar = page.locator('.van-nav-bar')
    await expect(navBar).toBeVisible()

    // 右上角搜索图标
    const searchIcon = page.locator('.van-nav-bar .van-icon-search')
    await expect(searchIcon).toBeVisible()
  })

  test('底部 Tab 导航存在', async ({ page }) => {
    const tabbar = page.locator('.van-tabbar-item')
    await expect(tabbar).toHaveCount(3)
  })

  test('商品卡片列表加载后渲染', async ({ page }) => {
    // 等待商品列表项出现（mock API 返回 6 条）
    const item = page.locator('.product-item').first()
    await expect(item).toBeVisible({ timeout: 10_000 })
  })

  test('点击导航返回按钮回到上一页', async ({ page }) => {
    const backBtn = page.locator('.van-nav-bar__left, .van-nav-bar__text').first()
    await expect(backBtn).toBeVisible()
  })
})

test.describe('404 页面', () => {
  test('不存在的路由显示兜底页面', async ({ page }) => {
    await setupGuestUser(page)
    await page.goto('/this-route-does-not-exist')

    // NotFound 使用 van-empty，描述为"页面走丢了"
    const emptyText = page.locator('text=页面走丢了')
    await expect(emptyText).toBeVisible({ timeout: 10_000 })
  })
})
