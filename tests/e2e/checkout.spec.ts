/**
 * 核心购物闭环 E2E 测试
 * 覆盖：登录 → 商品详情 → 加入购物车 → 结算 → 支付 → 查看订单
 */
import { test, expect } from '@playwright/test'
import { setupLoggedInUser } from './mocks/handlers'

test.describe('登录后完整购物闭环', () => {
  test.beforeEach(async ({ page }) => {
    await setupLoggedInUser(page)
  })

  test('登录 → 浏览商品 → 加入购物车 → 结算 → 支付 → 查看订单', async ({ page }) => {
    // ── Step 1: 登录 ──
    await page.goto('/login')
    await expect(page.locator('.login-btn')).toBeVisible()

    await page.fill('input[name="mobile"]', '13800138000')
    await page.fill('input[name="password"]', '123456')
    await page.click('button.login-btn')

    // 登录成功后跳转到首页
    await expect(page).toHaveURL('/', { timeout: 10_000 })

    // ── Step 2: 进入商品详情页 ──
    await page.goto('/product/info?proid=1')
    await expect(page.locator('h1.product-title')).toBeVisible({ timeout: 10_000 })

    // ── Step 3: 加入购物车 ──
    const addToCartBtn = page.locator('.van-action-bar').locator('button:has-text("加入购物车")')
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // 等待 SKU 面板弹出
    const skuPopup = page.locator('.sku-popup')
    await expect(skuPopup).toBeVisible({ timeout: 5_000 })

    // 如有多规格选项，选择第一个
    const specOptions = skuPopup.locator('.spec-option')
    if (
      await specOptions
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await specOptions.first().click()
      await page.waitForTimeout(200)
    }

    // 点击"确定"
    await skuPopup.locator('.sku-footer button:has-text("确定")').click()

    // 等待"添加成功"对话框
    const addSuccessDialog = page.locator('.van-dialog:has-text("宝贝已成功加入购物车")')
    await expect(addSuccessDialog).toBeVisible({ timeout: 5_000 })

    // 点击"去购物车"
    await addSuccessDialog.locator('button:has-text("去购物车")').click()

    // ── Step 4: 购物车 → 去结算 ──
    await expect(page).toHaveURL(/\/cart\/index/, { timeout: 5_000 })
    await expect(page.locator('.cart-item').first()).toBeVisible({ timeout: 5_000 })

    // 全选商品
    const selectAll = page.locator('.submit-bar .van-checkbox')
    await selectAll.click()
    await page.waitForTimeout(300)

    // 点击"结算"
    const checkoutBtn = page.locator('.submit-bar button:has-text("结算")')
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    // ── Step 5: 确认订单 → 提交 → 支付 ──
    await expect(page).toHaveURL(/\/cart\/confirm/, { timeout: 5_000 })
    await expect(page.locator('.goods-section .cart-item').first()).toBeVisible({ timeout: 5_000 })

    // 点击"提交订单"
    const submitBtn = page.locator('button:has-text("提交订单")')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // 确认对话框："是否确认提交订单"
    const confirmDialog = page.locator('.van-dialog:has-text("是否确认提交订单")')
    await expect(confirmDialog).toBeVisible({ timeout: 5_000 })
    await confirmDialog.locator('.van-dialog__confirm').click()

    // 支付对话框："是否立即支付？"
    const payDialog = page.locator('.van-dialog:has-text("是否立即支付")')
    await expect(payDialog).toBeVisible({ timeout: 5_000 })
    // 点击"立即支付"
    await payDialog.locator('button:has-text("立即支付")').click()

    // 支付成功对话框
    const successDialog = page.locator('.van-dialog:has-text("支付成功")')
    await expect(successDialog).toBeVisible({ timeout: 10_000 })

    // 点击"查看订单"
    await successDialog.locator('button:has-text("查看订单")').click()

    // ── Step 6: 验证订单列表 ──
    await expect(page).toHaveURL(/\/order\/index/, { timeout: 5_000 })
    await expect(page.locator('.order-card').first()).toBeVisible({ timeout: 10_000 })

    // 验证订单状态为"待发货"
    const statusText = await page.locator('.order-card .order-status').first().textContent()
    expect(statusText).toContain('待发货')
  })

  test('登录 → 商品详情 → 稍后支付 → 在待付款页看到订单', async ({ page }) => {
    // ── 登录 ──
    await page.goto('/login')
    await expect(page.locator('.login-btn')).toBeVisible()
    await page.fill('input[name="mobile"]', '13800138000')
    await page.fill('input[name="password"]', '123456')
    await page.click('button.login-btn')
    await expect(page).toHaveURL('/', { timeout: 10_000 })

    // ── 加入购物车（复用已知流程） ──
    await page.goto('/product/info?proid=1')
    await expect(page.locator('h1.product-title')).toBeVisible({ timeout: 10_000 })

    await page.locator('.van-action-bar').locator('button:has-text("加入购物车")').click()
    await expect(page.locator('.sku-popup')).toBeVisible({ timeout: 5_000 })

    await page.locator('.sku-popup .sku-footer button:has-text("确定")').click()
    await expect(page.locator('.van-dialog:has-text("宝贝已成功加入购物车")')).toBeVisible({ timeout: 5_000 })

    // 点击"再看看"留在商品页，然后手动去购物车（验证另一种路径）
    await page.locator('.van-dialog:has-text("宝贝已成功加入购物车") button:has-text("再看看")').click()
    await page.waitForTimeout(500)

    // 通过底部导航去购物车
    await page.goto('/cart/index')
    await expect(page.locator('.cart-item').first()).toBeVisible({ timeout: 5_000 })

    // 全选并结算
    await page.locator('.submit-bar .van-checkbox').click()
    await page.waitForTimeout(300)
    await page.locator('.submit-bar button:has-text("结算")').click()

    // ── 提交订单 → 稍后支付 ──
    await expect(page).toHaveURL(/\/cart\/confirm/, { timeout: 5_000 })
    await page.locator('button:has-text("提交订单")').click()

    await expect(page.locator('.van-dialog:has-text("是否确认提交订单")')).toBeVisible({ timeout: 5_000 })
    await page.locator('.van-dialog__confirm').click()

    await expect(page.locator('.van-dialog:has-text("是否立即支付")')).toBeVisible({ timeout: 5_000 })
    // 这次选择"稍后支付"
    await page.locator('.van-dialog:has-text("是否立即支付") button:has-text("稍后支付")').click()

    // ── 验证跳转到待付款页 ──
    await expect(page).toHaveURL(/\/order\/index/, { timeout: 5_000 })

    // 验证"待付款"tab 被激活
    const pendingTab = page.locator('.van-tab--active:has-text("待付款")')
    await expect(pendingTab).toBeVisible({ timeout: 5_000 })
  })
})
