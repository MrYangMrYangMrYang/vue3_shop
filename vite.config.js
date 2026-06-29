import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      Components({
        resolvers: [VantResolver()]
      }),
      // 生产环境：预压缩（brotli + gzip 双格式，Nginx 按请求头自动选最优）
      // 一个实例配置双算法，filename 留空让插件按算法自动取 [path][base].br / [path][base].gz
      isProd &&
        compression({
          algorithms: ['brotliCompress', 'gzip'],
          exclude: [/\.html$/, /\.map$/],
          deleteOriginalAssets: false,
          threshold: 1024
        }),
      // 生产环境：产物占比分析图（生成 dist/stats.html，不自动打开）
      isProd &&
        visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false
        })
    ].filter(Boolean),
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'vant-vendor': ['vant']
          }
        }
      }
    },
    server: {
      port: 6060,
      proxy: {
        '/shop': {
          target: env.VITE_API_TARGET || 'http://www.fastadmin.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/shop/, '/index.php/shop')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
})
