/**
 * 首页 E2E 测试 — 游客浏览商城核心流程
 */
import { test, expect } from '@playwright/test'
import { setupGuestUser } from './mocks/handlers'

test.describe('首页（游客）', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestUser(page)
    await page.goto('/')
    // 等待首页骨架消失 / 真实内容渲染（加载完成后骨架屏会移除）
    await page
      .waitForFunction(
        () => {
          const sk = document.querySelector('.home-skeleton')
          return !sk || sk.clientHeight === 0
        },
        { timeout: 10_000 }
      )
      .catch(() => {})
  })

  test('页面标题正确显示', async ({ page }) => {
    await expect(page).toHaveTitle(/VueShop/)
  })

  test('底部导航栏渲染三个 Tab', async ({ page }) => {
    const tabbar = page.locator('.van-tabbar-item')
    await expect(tabbar).toHaveCount(3)

    const tabTexts = await tabbar.allTextContents()
    expect(tabTexts.some(t => t.includes('首页'))).toBeTruthy()
    expect(tabTexts.some(t => t.includes('购物车'))).toBeTruthy()
    expect(tabTexts.some(t => t.includes('我的'))).toBeTruthy()
  })

  test('首页渲染热门商品轮播（van-swipe）', async ({ page }) => {
    const swipe = page.locator('.van-swipe')
    await expect(swipe).toBeVisible({ timeout: 10_000 })
  })

  test('分类导航区域存在', async ({ page }) => {
    const categorySection = page.locator('.category-section')
    await expect(categorySection).toBeVisible({ timeout: 10_000 })
  })

  test('点击"全部分类"跳转到商品列表页', async ({ page }) => {
    const allCategory = page.locator('.category-item').first()
    await expect(allCategory).toBeVisible({ timeout: 10_000 })
    await allCategory.click()
    await expect(page).toHaveURL(/\/product\/list/, { timeout: 5_000 })
  })

  test('好物推荐区域渲染商品卡片', async ({ page }) => {
    const items = page.locator('.product-grid li')
    const firstItem = items.first()
    await expect(firstItem).toBeVisible({ timeout: 10_000 })
  })

  test('点击底部"我的"触发登录拦截重定向', async ({ page }) => {
    const myTab = page.locator('.van-tabbar-item').filter({ hasText: '我的' })
    await myTab.click()
    // 未登录被路由守卫拦截，跳转到 /login?redirect=...
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })
})
