/**
 * 截图脚本：为 README 生成项目展示截图
 * 使用 Playwright + mock API，不依赖后端
 *
 * 用法：npx tsx e2e/screenshots.ts
 */
import { chromium } from '@playwright/test'
import { setupGuestUser, setupLoggedInUser } from './mocks/handlers'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'http://localhost:6060'
const OUTPUT_DIR = path.resolve(__dirname, '../docs/screenshots')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X 尺寸
    deviceScaleFactor: 2 // 2x 高清截图
  })

  const page = await context.newPage()

  // ─── 1. 首页 ───
  await setupGuestUser(page)
  await page.goto(BASE_URL)
  await page.waitForSelector('.category-section, .home-skeleton', { timeout: 15_000 })
  // 等待骨架屏消失
  await page.waitForFunction(() => !document.querySelector('.home-skeleton'), { timeout: 15_000 }).catch(() => {})
  await page.waitForTimeout(500) // 等图片 lazy-load
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'home.png'), fullPage: false })

  // ─── 2. 商品列表 ───
  await page.goto(`${BASE_URL}/product/list`)
  await page.waitForSelector('.product-item, .van-empty', { timeout: 10_000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'product-list.png'), fullPage: false })

  // ─── 3. 商品详情 ───
  await page.goto(`${BASE_URL}/product/info?proid=1`)
  await page.waitForTimeout(2_000) // 等商品详情 API 渲染
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'product-info.png'), fullPage: false })

  // ─── 4. 购物车（需登录态） ───
  await setupLoggedInUser(page)
  await page.goto(`${BASE_URL}/cart/index`)
  await page.waitForTimeout(2_000)
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'cart.png'), fullPage: false })

  // ─── 5. 订单列表（需登录态） ───
  await page.goto(`${BASE_URL}/order/index`)
  await page.waitForTimeout(2_000)
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'order-list.png'), fullPage: false })

  // ─── 6. 个人中心（需登录态） ───
  await page.goto(`${BASE_URL}/business/index`)
  await page.waitForTimeout(2_000)
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'business.png'), fullPage: false })

  await browser.close()
  console.log(`✅ 6 张截图已保存至 ${OUTPUT_DIR}`)
}

main().catch(err => {
  console.error('截图失败:', err)
  process.exit(1)
})
