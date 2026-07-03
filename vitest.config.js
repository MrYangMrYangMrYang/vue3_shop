import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/utils/**', 'src/components/**/*.vue', 'src/hooks/**', 'src/stores/**', 'src/services/**'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**']
    }
  }
})
