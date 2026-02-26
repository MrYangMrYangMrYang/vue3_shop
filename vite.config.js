import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

//引入路径模块
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    port:6060,
    proxy: { //接口请求代理配置
      '/shop': {
        target: 'http://www.fastadmin.com/index.php/shop',
        changeOrigin: true, //设置允许跨域
        //替换掉api前缀 防止多个api地址
        rewrite: (path) => path.replace(/^\/shop/, '')
      }
    }
  },
  resolve:{
    alias:{
      //配置了一个路径的别名，@ == 代表就是一个绝对路径 会指向到的 src目录下
      "@": path.resolve(__dirname, "src"),
    }
  }
})
