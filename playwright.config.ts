import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'e2e/report' }], ['list']],

  use: {
    baseURL: 'http://localhost:6060',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 7'] } // 移动端视口
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:6060',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
})
