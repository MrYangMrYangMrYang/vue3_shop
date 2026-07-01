/**
 * 登录/注册页面 E2E 测试
 */
import { test, expect } from '@playwright/test'
import { setupGuestUser } from './mocks/handlers'

test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestUser(page)
    await page.goto('/login')
  })

  test('登录页表单渲染完整', async ({ page }) => {
    // 手机号输入框（van-field 内部 input）
    const phoneInput = page.locator('input[type="tel"], input[type="text"]').first()
    await expect(phoneInput).toBeVisible()

    // 登录按钮
    const loginBtn = page.locator('.login-btn, button').filter({ hasText: /登/ })
    await expect(loginBtn).toBeVisible()
  })

  test('显示注册入口文字', async ({ page }) => {
    const registerText = page.locator('text=没有账号？立即注册')
    await expect(registerText).toBeVisible()
  })

  test('点击注册链接跳转到注册页', async ({ page }) => {
    const registerLink = page.locator('.register-link')
    await registerLink.click()
    await expect(page).toHaveURL(/\/register/, { timeout: 5_000 })
  })
})

test.describe('注册页', () => {
  test.beforeEach(async ({ page }) => {
    await setupGuestUser(page)
    await page.goto('/register')
  })

  test('注册页标题渲染', async ({ page }) => {
    const title = page.locator('.title')
    await expect(title).toBeVisible()
    await expect(title).toHaveText('加入我们')
  })

  test('发送验证码按钮存在', async ({ page }) => {
    const codeBtn = page.locator('.code-btn, button').filter({ hasText: /获取验证码/ })
    await expect(codeBtn).toBeVisible()
  })

  test('注册按钮存在', async ({ page }) => {
    // .register-card 内的提交按钮
    const submitBtn = page
      .locator('.register-card button[type="submit"], .register-card .van-button')
      .filter({ hasText: /注册|注 册/ })
    await expect(submitBtn).toBeVisible()
  })
})
