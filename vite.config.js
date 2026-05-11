import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
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
    proxy: { //接口请求代理配置
      '/shop': {
        target: 'http://www.fastadmin.com',
        changeOrigin: true, //设置允许跨域
        //替换掉api前缀 防止多个api地址
        rewrite: (path) => path.replace(/^\/shop/, '/index.php/shop')
      }
    }
  },
  resolve: {
    alias: {
      //配置了一个路径的别名，@ == 代表就是一个绝对路径 会指向到的 src目录下
      "@": path.resolve(__dirname, "src"),
    }
  }
})
