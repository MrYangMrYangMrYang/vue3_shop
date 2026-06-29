# 🛒 Vue Shop - 移动端电商项目

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vant-4.x-07C160?style=flat-square&logo=vant&logoColor=white" alt="Vant" />
  <img src="https://img.shields.io/badge/Pinia-3.x-F9A825?style=flat-square&logo=pinia&logoColor=white" alt="Pinia" />
  <img src="https://img.shields.io/badge/Vitest-163%20tests-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <a href="http://8.163.98.227:8083" target="_blank">
    <img src="https://img.shields.io/badge/Preview-Online-green?style=flat-square&logo=google-chrome&logoColor=white" alt="Online Preview" />
  </a>
</p>

<p align="center">
  <strong>基于 Vue 3 + TypeScript + Vite + Vant 构建的现代化移动端商城解决方案</strong>
</p>

<p align="center">
  <a href="http://8.163.98.227:8083" target="_blank">🌐 在线预览</a>
</p>

---

## 📖 目录

- [✨ 项目简介](#-项目简介)
- [📸 项目截图](#-项目截图)
- [🎯 核心特性](#-核心特性)
- [🛠️ 技术栈](#️-技术栈)
- [📦 快速开始](#-快速开始)
- [📁 项目结构](#-项目结构)
- [🏗️ 架构设计](#️-架构设计)
- [🔧 工程化体系](#-工程化体系)
- [⚡ 性能优化](#-性能优化)
- [💼 业务模块](#-业务模块)
- [⚙️ 配置说明](#️-配置说明)
- [🚀 部署指南](#-部署指南)
- [❓ 常见问题](#-常见问题)
- [📄 许可证](#-许可证)

---

## ✨ 项目简介

Vue Shop 是一个功能完善的**移动端电商前端项目**，采用 Vue 3 Composition API + `<script setup>` + TypeScript 语法开发，覆盖从用户注册登录、商品浏览、购物车管理、订单处理到售后服务的完整电商业务闭环。工程化方面配备 TypeScript 类型检查、Vitest 单元测试（163 用例 / 98.64% 覆盖率）、ESLint + Prettier 代码规范、Husky + commitlint 提交规范、GitHub Actions CI 全流程质量门禁。

---

## 📸 项目截图

<!-- 截图占位：取消注释并替换为实际截图路径

<table>
  <tr>
    <td width="33%" align="center"><img src="docs/screenshots/home.png" alt="首页"><br>首页</td>
    <td width="33%" align="center"><img src="docs/screenshots/product-list.png" alt="商品列表"><br>商品列表</td>
    <td width="33%" align="center"><img src="docs/screenshots/product-info.png" alt="商品详情"><br>商品详情</td>
  </tr>
  <tr>
    <td width="33%" align="center"><img src="docs/screenshots/cart.png" alt="购物车"><br>购物车</td>
    <td width="33%" align="center"><img src="docs/screenshots/order-list.png" alt="订单列表"><br>订单列表</td>
    <td width="33%" align="center"><img src="docs/screenshots/business.png" alt="个人中心"><br>个人中心</td>
  </tr>
</table>

-->

---

## 🎯 核心特性

### 用户系统

- 🔐 手机号注册/登录
- 👤 个人资料管理（头像、昵称、邮箱验证）
- 📍 多地址管理（增删改查、默认地址设置、省市区三级联动）

### 商品模块

- 🏠 首页展示（轮播图、分类导航一行四个滑动、热门推荐）
- 📋 商品列表（分类筛选、关键词搜索、多维度排序、分页加载）
- 🔍 商品详情（图片预览、规格选择、客服联系）
- 🛒 购物车功能（数量调整、商品删除、全选结算）

### 订单系统

- 📝 订单创建（地址选择、备注填写、金额计算）
- 💳 支付流程（立即支付、稍后支付、支付状态跟踪）
- 📊 订单管理（多状态 Tab 筛选、待支付倒计时）
- 🚚 物流查询（实时物流信息展示）
- ⭐ 商品评价（图文评价、评分系统）
- 🔄 售后服务（退货申请、退款处理）

---

## 🛠️ 技术栈

### 核心框架

| 技术                                               | 版本    | 用途                     |
| -------------------------------------------------- | ------- | ------------------------ |
| [Vue.js](https://vuejs.org/)                       | ^3.2.47 | 渐进式 JavaScript 框架   |
| [Vite](https://vitejs.dev/)                        | ^4.3.9  | 下一代前端构建工具       |
| [Vue Router](https://router.vuejs.org/)            | ^4.2.2  | 官方路由管理器           |
| [Pinia](https://pinia.vuejs.org/)                  | ^3.0.4  | Vue 状态管理库           |
| [Vant](https://vant-ui.github.io/)                 | ^4.6.0  | 移动端 UI 组件库         |
| [Axios](https://axios-http.com/)                   | ^1.4.0  | HTTP 客户端              |
| [DOMPurify](https://github.com/cure53/DOMPurify)   | ^3.4.11 | XSS 净化（富文本防注入） |
| [@vant/area-data](https://github.com/vant-ui/vant) | ^1.4.1  | 省市区数据               |

### 工程化工具链

| 技术                                                      | 版本    | 用途                         |
| --------------------------------------------------------- | ------- | ---------------------------- |
| [TypeScript](https://www.typescriptlang.org/)             | ~5.4.5  | 类型安全（渐进式迁移）       |
| [vue-tsc](https://github.com/vuejs/language-tools)        | ^1.8.27 | Vue SFC 类型检查             |
| [Vitest](https://vitest.dev/)                             | ^4.1.9  | 单元测试框架                 |
| [@vitest/coverage-v8](https://vitest.dev/)                | ^4.1.9  | 测试覆盖率（V8 provider）    |
| [ESLint](https://eslint.org/)                             | ^8.57.1 | 代码规范检查                 |
| [Prettier](https://prettier.io/)                          | ^3.9.1  | 代码格式化                   |
| [Husky](https://typicode.github.io/husky/)                | ^9.1.7  | Git Hooks                    |
| [lint-staged](https://github.com/lint-staged/lint-staged) | ^16.4.0 | 暂存区代码检查               |
| [@commitlint](https://commitlint.js.org/)                 | ^21.1.0 | 提交信息规范（Conventional） |

---

## 📦 快速开始

### 环境要求

- **Node.js**: >= 18.x
- **npm**: >= 8.x

### 安装步骤

```bash
# 克隆项目
git clone <your-repository-url>
cd vue_shop

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

访问 http://localhost:6060 查看应用

### 工程化脚本

```bash
npm run type-check     # TypeScript 类型检查（vue-tsc --noEmit）
npm run lint           # ESLint 自动修复
npm run lint:check     # ESLint 仅检查（CI 用）
npm run format         # Prettier 格式化
npm run test           # 单元测试（单次运行）
npm run test:watch     # 单元测试（监听模式）
npm run test:coverage  # 单元测试 + 覆盖率报告
```

---

## 📁 项目结构

```
vue_shop/
├── .github/workflows/               # GitHub Actions CI（lint → type-check → test → build）
├── public/                          # 静态资源
├── src/
│   ├── assets/styles/               # 全局样式
│   ├── components/                  # 页面组件
│   │   ├── business/                # 用户中心（资料、邮箱、地址管理）
│   │   ├── cart/                    # 购物车（列表、结算）
│   │   ├── common/                  # 公共组件（底部导航、网络错误页）
│   │   ├── order/                   # 订单（列表、详情、物流、评价）
│   │   ├── product/                 # 商品（列表、详情、SKU 选择器）
│   │   ├── home.vue                 # 首页
│   │   ├── login.vue                # 登录页（lang="ts"）
│   │   ├── register.vue             # 注册页（lang="ts"）
│   │   └── NotFound.vue             # 404 兜底页
│   ├── constants/order.ts           # 常量定义（订单状态枚举）
│   ├── hooks/                       # Composable（useCountdown / useBack，.ts）
│   ├── routers/index.ts             # 路由配置与守卫（含 RouteMeta 类型扩展）
│   ├── services/request.ts          # 请求层（Axios 独立实例、拦截器、去重、重试）
│   ├── stores/                      # Pinia 状态（user / cart / pendingPayment / completedLocalOrders，.ts）
│   ├── utils/                       # 工具函数（10 个 .ts：cache / currency / date / debounce / throttle / validate 等）
│   │   └── __tests__/               # 单元测试（10 个 .test.ts，88 用例）
│   ├── App.vue                      # 根组件（suspense + 路由切换动画）
│   ├── main.ts                      # 应用入口（全局错误处理）
│   └── env.d.ts                     # Vite 环境变量类型声明
├── .eslintrc.cjs / .prettierrc      # 代码规范配置
├── .env.development / .env.production / .env.example  # 环境变量
├── tsconfig.json                    # TypeScript 配置（渐进式迁移）
├── vite.config.js                   # Vite 配置
└── package.json
```

---

## 🏗️ 架构设计

### 分层架构

```
┌──────────────────────────────────────────────────┐
│  View Layer        页面组件（home / list / info） │
├──────────────────────────────────────────────────┤
│  Composable Layer  Hooks 复用逻辑（useCountdown） │
├──────────────────────────────────────────────────┤
│  State Layer       Pinia Store（user / cart）     │
├──────────────────────────────────────────────────┤
│  Service Layer     Axios 封装（拦截器 + 去重）     │
├──────────────────────────────────────────────────┤
│  Utils Layer       纯函数工具（cache / currency）  │
├──────────────────────────────────────────────────┤
│  Infra Layer       Router / Config / Constants    │
└──────────────────────────────────────────────────┘
```

### 三级缓存策略

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Pinia Store                           │
│  全局共享状态 + localStorage 持久化               │
│  适用：用户信息、购物车、待支付订单                │
├─────────────────────────────────────────────────┤
│  Layer 2: sessionStorage + TTL                  │
│  页面级临时缓存，关闭标签页自动清除                │
│  适用：首页数据、列表状态、分类数据                │
├─────────────────────────────────────────────────┤
│  Layer 3: keep-alive                            │
│  组件级缓存，仅缓存商品列表页                     │
│  适用：列表页滚动位置、筛选条件恢复               │
└─────────────────────────────────────────────────┘
```

---

## 🔧 工程化体系

### TypeScript 渐进式迁移

采用 `allowJs` 策略实现 JS→TS 平滑过渡，非组件层 100% TS 化，核心业务组件已迁移至 `<script setup lang="ts">`。已开启 `strictNullChecks` + `noImplicitAny` 核心类型检查。

| 层级      | 文件数 | 说明                                                                                |
| --------- | ------ | ----------------------------------------------------------------------------------- |
| utils     | 10     | 全部 `.ts`，含完整 JSDoc + 类型导出                                                 |
| stores    | 4      | user / cart / pendingPayment / completedLocalOrders                                 |
| hooks     | 3      | useCountdown / useBack / index                                                      |
| services  | 1      | request.ts（ApiResult / RequestOptions 接口 + 拦截器）                              |
| constants | 1      | order.ts（ORDER_STATUS 枚举）                                                       |
| routers   | 1      | index.ts（含 RouteMeta 模块增强）                                                   |
| 入口      | 2      | main.ts / env.d.ts（Vite 环境变量类型）                                             |
| 组件      | 7      | SkuPanel / login / register / product-info / cart-confirm / order-index / OrderCard |

```bash
npm run type-check   # vue-tsc --noEmit，0 errors
```

### 单元测试

基于 Vitest + happy-dom，覆盖 utils / stores / hooks / services 四层，共 **163 个用例**。

```bash
npm run test              # 单次运行
npm run test:watch        # 监听模式
npm run test:coverage     # 覆盖率报告
```

| 指标 | 覆盖率 |
| ---- | ------ |
| 语句 | 98.64% |
| 分支 | 98.86% |
| 函数 | 100%   |
| 行   | 98.38% |

### 代码规范

- **ESLint 8** + **eslint-plugin-vue** + **@typescript-eslint**：`.eslintrc.cjs` 配置 JS/TS/Vue 三套 overrides
- **Prettier 3**：统一格式化，`.prettierrc` + `.editorconfig` + `.prettierignore`
- **Husky + lint-staged**：`pre-commit` 钩子对暂存区文件执行 eslint --fix + prettier --write
- **commitlint**：`commit-msg` 钩子校验 Conventional Commits 规范（header ≤ 100 字符）

```bash
npm run lint          # eslint --fix 自动修复
npm run lint:check    # 仅检查不修改
npm run format        # prettier --write
```

### 持续集成（GitHub Actions）

`.github/workflows/ci.yml` 在 push/PR 时自动执行四步质量门禁：

```
checkout → Node 20 → npm ci → lint:check → type-check → test → build
```

`concurrency` 配置取消同分支旧运行，节省 CI 资源。

### 安全防护

- **XSS 净化**：商品详情富文本通过 [DOMPurify](https://github.com/cure53/DOMPurify) 净化后再 `v-html` 渲染，防止后端内容注入
- **Token 鉴权**：请求拦截器条件式注入 `Authorization: Bearer <token>`
- **401 自动登出**：响应拦截器收到 401 → 清除用户状态 → 跳转登录页（携带 redirect）
- **请求去重**：`AbortController` + `pendingMap`，仅对 GET 请求去重（写操作不去重，避免丢业务请求）

---

## ⚡ 性能优化

### 构建层优化

| 优化项             | 实现方式                                     | 效果                               |
| ------------------ | -------------------------------------------- | ---------------------------------- |
| **手动分包**       | `manualChunks` 拆分 vue-vendor / vant-vendor | 框架代码独立，业务更新不重复下载   |
| **组件按需导入**   | `unplugin-vue-components` + `VantResolver`   | Vant 样式从全量 103KB 降至按需加载 |
| **函数式样式按需** | 手动导入 toast/dialog 等 5 个函数式组件样式  | 补全插件盲区，仅 ~13KB             |
| **路由懒加载**     | 所有路由组件 `() => import()` 动态导入       | 首屏 JS 体积减少约 50%             |
| **Brotli 预压缩**  | `vite-plugin-compression2` 生成 `.br` 文件   | 比 gzip 再小 10%，Nginx 直吐省 CPU |
| **产物分析**       | `rollup-plugin-visualizer` 生成 stats.html   | 可视化产物占比，定位优化点         |

### 请求层优化

| 优化项           | 实现方式                         | 效果                                    |
| ---------------- | -------------------------------- | --------------------------------------- |
| **请求去重**     | `AbortController` + `pendingMap` | 仅 GET 去重，写操作不去重避免丢业务请求 |
| **统一错误处理** | 响应拦截器 HTTP 状态码映射       | 业务代码无需重复处理错误                |
| **图片路径转换** | `processImages` 递归处理响应数据 | 后端绝对 URL 自动转相对路径             |
| **搜索防抖**     | `debounce(fn, 300)` 包裹搜索函数 | 从源头减少无效请求                      |

### 状态层优化

| 优化项            | 实现方式                                             | 效果                                      |
| ----------------- | ---------------------------------------------------- | ----------------------------------------- |
| **TTL 缓存**      | `sessionStorage` + 过期时间自动清理                  | 首页重复访问秒开                          |
| **精准缓存恢复**  | `onDeactivated` 保存路由参数，`onActivated` 对比判断 | keep-alive 缓存恢复与路由跳转刷新精准切换 |
| **搜索/分类互斥** | 搜索时重置分类，切换分类时清空关键词                 | 避免两种筛选条件互相干扰                  |
| **智能定时器**    | `useCountdown` 有待支付订单才启动，无则自动停止      | 无订单时零 CPU 开销                       |

### 交互层优化

| 优化项           | 实现方式                        | 效果                        |
| ---------------- | ------------------------------- | --------------------------- |
| **图片懒加载**   | Vant Lazyload 组件              | 首屏只加载可视区域图片      |
| **分类导航滑动** | `flex: 0 0 25%` + `scroll-snap` | 一行固定 4 个，滑动吸附对齐 |
| **路由切换动画** | `transition` + `fade-slide`     | 页面切换流畅过渡            |

### 构建产物

```
dist/assets/
├── vue-vendor-*.js          109 KB (gzip: 43 KB)   # Vue + Router + Pinia
├── vant-vendor-*.js         128 KB (gzip: 45 KB)   # Vant 组件库
├── index-*.js               47 KB  (gzip: 17 KB)   # 应用入口 + 路由
├── info-*.js                36 KB  (gzip: 14 KB)   # 商品详情（含 SkuPanel）
├── index-*.js (order)       11 KB  (gzip: 4.4 KB)  # 订单列表
├── confirm-*.js             8.5 KB (gzip: 3.7 KB)  # 确认订单
├── list-*.js                7 KB   (gzip: 3 KB)    # 商品列表
├── home-*.js                5 KB   (gzip: 2.3 KB)  # 首页
└── ...                      其余 chunk 均 < 5 KB，按需加载
```

> 业务 chunk 最大 36 KB（商品详情），首屏仅加载 vue-vendor + vant-vendor + index + home ≈ 289 KB（gzip ≈ 108 KB）。

---

## 💼 业务模块

### 用户认证

- 手机号 + 密码注册/登录
- 登录状态持久化（localStorage）
- 未登录路由拦截（全局守卫 + `checkLogin` 校验）

**关键文件**: [`login.vue`](src/components/login.vue) · [`user.ts`](src/stores/user.ts) · [`index.ts`](src/routers/index.ts)

### 地址管理

- 收货地址 CRUD、默认地址切换
- 省市区三级联动（@vant/area-data）
- 下单场景地址选择（带返回参数）

**关键文件**: [`address/`](src/components/business/address/) · [`user.ts`](src/stores/user.ts)

### 商品浏览

- 首页数据展示 + 5 分钟 TTL 缓存
- 分类筛选 + 关键词搜索（防抖 + 互斥）
- 商品列表分页加载 + keep-alive 缓存恢复
- 商品详情（图片预览、加入购物车、立即购买）

**关键文件**: [`home.vue`](src/components/home.vue) · [`list.vue`](src/components/product/list.vue) · [`info.vue`](src/components/product/info.vue) · [`cache.ts`](src/utils/cache.ts) · [`debounce.ts`](src/utils/debounce.ts)

### 购物车

- 商品数量调整、单选/全选、删除
- 实时总价计算、批量结算跳转
- 购物车数量 Store 同步底部导航 Badge

**关键文件**: [`cart/index.vue`](src/components/cart/index.vue) · [`cart/confirm.vue`](src/components/cart/confirm.vue) · [`cart.ts`](src/stores/cart.ts)

### 订单管理

- 多状态 Tab 筛选 + 待支付 30 分钟倒计时
- 支付流程（本地模拟 + 服务端真实支付）
- 物流查询、确认收货、商品评价、申请售后
- 待支付订单自动清理过期、本地订单离线查看

**关键文件**: [`order/`](src/components/order/) · [`pendingPayment.ts`](src/stores/pendingPayment.ts) · [`completedLocalOrders.ts`](src/stores/completedLocalOrders.ts) · [`order.ts`](src/constants/order.ts) · [`useCountdown.ts`](src/hooks/useCountdown.ts)

---

## ⚙️ 配置说明

### 环境变量

项目通过 Vite 的 `loadEnv` 加载环境变量，三个环境文件各有用途：

| 文件               | 说明                                     |
| ------------------ | ---------------------------------------- |
| `.env.development` | 开发环境（含代理目标 `VITE_API_TARGET`） |
| `.env.production`  | 生产环境                                 |
| `.env.example`     | 示例文件（复制为新环境后修改）           |

```bash
# .env.example 关键变量
VITE_API_BASE_URL=/shop              # API 基础路径
VITE_API_TARGET=http://www.fastadmin.com  # 开发环境代理目标
VITE_IMAGE_DOMAIN=www.fastadmin.com  # 后端图片域名（响应数据路径转换用）
```

### 构建配置 ([`vite.config.js`](vite.config.js))

```javascript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      Components({ resolvers: [VantResolver()] }) // Vant 按需导入
    ],
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
      alias: { '@': path.resolve(__dirname, 'src') }
    }
  }
})
```

### 修改后端接口地址

编辑 `.env.development` 中的 `VITE_API_TARGET` 和 `vite.config.js` 中的 `rewrite` 规则即可。

---

## 🚀 部署指南

### Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vue_shop/dist;
    index index.html;

    # Vue Router History 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /shop/ {
        proxy_pass http://www.fastadmin.com/index.php/shop/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 预压缩文件优先（brotli > gzip > 原始）
    # 需加载 ngx_brotli 模块；若未安装则仅用 gzip_static
    brotli_static on;
    gzip_static on;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ❓ 常见问题

**Q: 为什么评价相关接口拼写为 eveluate？**

A: 后端接口路径 `/order/eveluate` 沿用历史命名无法修改，前端已将路由名、组件名、文件名统一修正为 `evaluate`，仅在调用后端接口时保留原始拼写。

**Q: 缓存数据什么时候失效？**

- `sessionStorage` + TTL：关闭标签页或超时后失效
- `localStorage`：手动清除或调用清除方法时失效
- `keep-alive`：组件被排除缓存时失效

**Q: 如何切换到自己的后端服务？**

1. 编辑 `vite.config.js`
2. 修改 `server.proxy['/shop'].target` 为你的后端地址
3. 调整 `rewrite` 规则
4. 重启开发服务器

**Q: 生产环境如何配置 API 地址？**

推荐通过 Nginx 反向代理配置，或使用相对路径让前端自动继承当前域名。

---

## 📄 许可证

[MIT License](LICENSE)

Copyright (c) 2024 Vue Shop
