# 🛒 Vue Shop - 移动端电商项目

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vant-4.x-07C160?style=flat-square&logo=vant&logoColor=white" alt="Vant" />
  <img src="https://img.shields.io/badge/Pinia-3.x-F9A825?style=flat-square&logo=pinia&logoColor=white" alt="Pinia" />
  <img src="https://img.shields.io/badge/Vitest-236%20tests-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

<p align="center">
  <strong>基于 Vue 3 + TypeScript + Vite + Vant 构建的现代化移动端商城解决方案</strong>
</p>

---

## 📖 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [架构设计](#架构设计)
- [工程化体系](#工程化体系)
- [性能优化](#性能优化)
- [业务模块](#业务模块)
- [配置说明](#配置说明)
- [部署指南](#部署指南)
- [常见问题](#常见问题)
- [许可证](#许可证)

---

## ✨ 项目简介

Vue Shop 是一个功能完善的**移动端电商前端项目**，采用 Vue 3 Composition API + `<script setup lang="ts">` + TypeScript 语法开发，覆盖从用户注册登录、商品浏览、购物车管理、订单处理到售后服务的完整电商业务闭环。工程化方面：TypeScript 严格模式 0 errors、Vitest 单元测试 236 用例、Playwright E2E 覆盖核心购物闭环、ESLint + Prettier 代码规范、Husky + commitlint 提交规范、GitHub Actions CI/CD 全链路质量门禁。

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

| 技术                                                     | 版本    | 用途                     |
| -------------------------------------------------------- | ------- | ------------------------ |
| [Vue.js](https://vuejs.org/)                             | 3.5     | 渐进式 JavaScript 框架   |
| [Vite](https://vitejs.dev/)                              | 4.5     | 下一代前端构建工具       |
| [Vue Router](https://router.vuejs.org/)                  | 4.6     | 官方路由管理器           |
| [Pinia](https://pinia.vuejs.org/)                        | ^3.0.4  | Vue 状态管理库           |
| [Vant](https://vant-ui.github.io/)                       | 4.10    | 移动端 UI 组件库         |
| [Axios](https://axios-http.com/)                         | 1.18    | HTTP 客户端              |
| [web-vitals](https://github.com/GoogleChrome/web-vitals) | ^5.3.0  | Core Web Vitals 性能监控 |
| [DOMPurify](https://github.com/cure53/DOMPurify)         | ^3.4.11 | XSS 净化（富文本防注入） |
| [@vant/area-data](https://github.com/vant-ui/vant)       | ^1.4.1  | 省市区数据               |

### 工程化工具链

| 技术                                                      | 版本    | 用途                         |
| --------------------------------------------------------- | ------- | ---------------------------- |
| [TypeScript](https://www.typescriptlang.org/)             | ~5.4.5  | 类型安全（渐进式迁移）       |
| [vue-tsc](https://github.com/vuejs/language-tools)        | ^2.2.12 | Vue SFC 类型检查             |
| [Vitest](https://vitest.dev/)                             | ^4.1.9  | 单元测试框架                 |
| [@vitest/coverage-v8](https://vitest.dev/)                | ^4.1.9  | 测试覆盖率（V8 provider）    |
| [ESLint](https://eslint.org/)                             | ^8.57.1 | 代码规范检查                 |
| [Prettier](https://prettier.io/)                          | 3.9     | 代码格式化                   |
| [Husky](https://typicode.github.io/husky/)                | ^9.1.7  | Git Hooks                    |
| [lint-staged](https://github.com/lint-staged/lint-staged) | ^16.4.0 | 暂存区代码检查               |
| [@commitlint](https://commitlint.js.org/)                 | 21.2    | 提交信息规范（Conventional） |
| [Playwright](https://playwright.dev/)                     | latest  | E2E 端到端测试               |

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

> 🌐 **在线预览**：[http://8.163.98.227:8083](http://8.163.98.227:8083)

### 工程化脚本

```bash
npm run type-check      # TypeScript 类型检查（vue-tsc --noEmit）
npm run lint            # ESLint 自动修复
npm run lint:check      # ESLint 仅检查（CI 用）
npm run format          # Prettier 格式化
npm run test            # 单元测试（单次运行）
npm run test:watch      # 单元测试（监听模式）
npm run test:coverage   # 单元测试 + 覆盖率报告
npm run test:e2e        # E2E 测试（Playwright）
npm run test:e2e:ui     # E2E 测试（交互式 UI）
npm run test:e2e:report # E2E 测试报告
```

---

## 📁 项目结构

```
vue_shop/
├── .github/workflows/               # GitHub Actions CI（lint → type-check → unit test → build → e2e）
├── .husky/                          # Git Hooks（pre-commit + commit-msg）
├── tests/e2e/                        # E2E 端到端测试（Playwright + Mock API）
├── public/                          # 静态资源（PWA manifest + Service Worker）
├── src/
│   ├── styles/                      # 全局样式（common.css）
│   ├── views/                       # 路由页面（18 个 .vue 文件）
│   │   ├── __tests__/               # 页面组件测试
│   │   ├── user/                    # 用户中心（资料、邮箱、地址管理）
│   │   ├── cart/                    # 购物车（列表、结算）
│   │   ├── order/                   # 订单（列表、详情、物流、评价）
│   │   ├── product/                 # 商品（列表、详情）
│   │   ├── home.vue                 # 首页
│   │   ├── login.vue                # 登录页
│   │   ├── register.vue             # 注册页
│   │   └── NotFound.vue             # 404 兜底页
│   ├── components/                  # 可复用组件（6 个 .vue 文件）
│   │   ├── common/                  # 底部导航 / 网络错误页 / 错误边界
│   │   │   └── __tests__/           # 公共组件测试
│   │   ├── product/                 # SkuPanel
│   │   │   └── __tests__/
│   │   ├── order/                   # OrderCard
│   │   └── cart/                    # ConfirmSkeleton
│   ├── constants/                   # 常量定义（order.ts 订单状态 + theme.ts 品牌色）
│   ├── hooks/                       # Composable（7 个，含 barrel export）
│   │   └── __tests__/               # Hooks 单元测试（4 个 .test.ts，36 用例）
│   ├── router/index.ts              # 路由配置与守卫（含 RouteMeta 类型扩展）
│   ├── services/                    # 请求层（Axios 实例、拦截器、去重、重试）
│   │   ├── request.ts
│   │   └── __tests__/               # request 单元测试（2 个 .test.ts，41 用例）
│   ├── stores/                      # Pinia 状态（user / cart / pendingPayment）
│   │   └── __tests__/               # stores 单元测试（3 个 .test.ts，53 用例）
│   ├── types/                       # 类型声明（shims.d.ts）
│   ├── utils/                       # 工具函数（10 个 .ts：cache / currency / date / debounce / validate / mask / clipboard / countdown / params / result）
│   │   └── __tests__/               # 单元测试（10 个 .test.ts，92 用例）
│   ├── App.vue                      # 根组件（Suspense + keep-alive + 路由切换动画）
│   ├── main.ts                      # 应用入口（全局错误处理 + Web Vitals 上报）
│   └── env.d.ts                     # Vite 环境变量类型声明
├── .editorconfig / .eslintrc.cjs / .prettierrc / .eslintignore / .prettierignore  # 代码规范配置
├── .env.development / .env.production / .env.example  # 环境变量
├── tsconfig.json / tsconfig.node.json  # TypeScript 配置
├── vite.config.js / vitest.config.js   # 构建 & 测试配置
├── commitlint.config.js / components.d.ts  # 提交规范 / 组件自动注册声明
├── docker/                            # Docker 部署（Dockerfile + nginx.conf）
└── package.json
```

---

## 🏗️ 架构设计

### 分层架构

```
┌──────────────────────────────────────────────────┐
│  View Layer        页面组件（home / list / info） │
├──────────────────────────────────────────────────┤
│  Composable Layer  Hooks 复用逻辑（useCountdown / useCartBadge / useCheckoutSubmit） │
├──────────────────────────────────────────────────┤
│  State Layer       Pinia Store（user / cart / pendingPayment） │
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

全部 18 个视图组件与 6 个公共组件均已使用 `<script setup lang="ts">`，非组件层 100% TypeScript。开启 `strict: true` 完整严格模式，结合 vue-tsc 2.x 确保类型检查无遗漏。

| 层级      | 文件数 | 说明                                                                                                                                                                                                                                                                       |
| --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utils     | 10     | 全部 `.ts`，含完整 JSDoc + 类型导出                                                                                                                                                                                                                                        |
| stores    | 3      | user / cart / pendingPayment                                                                                                                                                                                                                                               |
| hooks     | 7      | useCountdown / useBack / useAvatar / useCartBadge / useAbortController / useBusid / useCheckoutSubmit                                                                                                                                                                      |
| services  | 1      | request.ts（ApiResult / RequestOptions 接口 + 拦截器）                                                                                                                                                                                                                     |
| constants | 2      | order.ts（ORDER_STATUS 枚举）+ theme.ts（品牌色常量）                                                                                                                                                                                                                      |
| router    | 1      | index.ts（含 RouteMeta 模块增强）                                                                                                                                                                                                                                          |
| 入口      | 2      | main.ts / env.d.ts（Vite 环境变量类型）                                                                                                                                                                                                                                    |
| 组件      | 24     | 全部 `<script setup lang="ts">`（18 视图 + 6 组件）：home / login / register / list / info / SkuPanel / cart-index / confirm / ConfirmSkeleton / order-index / info / express / evaluate / NotFound / ErrorBoundary / Menu / NetworkError / profile / email / address 系列 |

```bash
npm run type-check   # vue-tsc --noEmit，0 errors
```

### 单元测试

基于 Vitest + happy-dom，覆盖 utils / stores / hooks / services / components 五层，共 **236 个用例**（23 个测试文件）：

| 层级       | 测试文件 | 用例数 | 覆盖重点                                                                       |
| ---------- | -------- | ------ | ------------------------------------------------------------------------------ |
| utils      | 10       | 92     | cache / currency / date / debounce / validate / mask 等                        |
| stores     | 3        | 53     | pendingPayment（32）/ user（13）/ cart（8）                                    |
| services   | 2        | 41     | request 拦截器（token / 401 / 重试 / silent）+ 去重 / 图片域名转换             |
| hooks      | 4        | 36     | useCountdown（11）/ useCheckoutSubmit（12）/ useAvatar（7）/ useCartBadge（6） |
| components | 4        | 14     | ErrorBoundary（4）/ SkuPanel（5）/ NetworkError / NotFound                     |

```bash
npm run test              # 单次运行
npm run test:watch        # 监听模式
npm run test:coverage     # 覆盖率报告
```

### E2E 端到端测试

基于 Playwright + Chromium（移动端视口），覆盖**游客浏览 / 登录注册 / 完整下单闭环** 5 个关键场景。API 调用全部通过 `page.route()` 内置 Mock 拦截，不依赖后端。

| 测试套件     | 用例数 | 覆盖场景                                        |
| ------------ | ------ | ----------------------------------------------- |
| 首页（游客） | 7      | 标题 / Tab 导航 / 轮播 / 分类 / 推荐 / 登录拦截 |
| 登录页       | 3      | 表单渲染 / 注册入口 / 跳转                      |
| 注册页       | 3      | 标题 / 验证码 / 提交按钮                        |
| 商品列表     | 5      | 标题 / 导航栏 / Tab / 列表渲染 / 返回           |
| 下单闭环     | 2      | 立即支付 / 稍后支付 → 加购 → 结算 → 查看订单    |
| 404 页面     | 1      | 兜底提示文案                                    |

```bash
npm run test:e2e           # 命令行运行
npm run test:e2e:ui        # 交互式 UI 模式
npm run test:e2e:report    # 查看 HTML 报告
```

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

`.github/workflows/ci.yml` 在 push/PR 时自动执行两个 Job：

```
quality:  checkout → Node 20 → npm ci → lint:check → type-check → unit test → build
e2e:      checkout → Node 20 → npm ci → 安装 Chromium → E2E test（依赖 quality 通过）
```

E2E 失败时自动上传 Playwright HTML 报告作为 artifact。`concurrency` 配置取消同分支旧运行，节省 CI 资源。

### 安全防护

- **XSS 净化**：商品详情富文本通过 [DOMPurify](https://github.com/cure53/DOMPurify) 净化后再 `v-html` 渲染，`vue/no-v-html` 规则设为 `warn`，仅在使用处行级禁用
- **Token 鉴权**：请求拦截器条件式注入 `Authorization: Bearer <token>`
- **401 自动登出**：响应拦截器收到 401 → 清除用户状态 → 跳转登录页（携带 redirect）
- **请求去重**：`AbortController` + `pendingMap`，仅对 GET 请求去重（写操作不去重，避免丢业务请求）
- **Nginx 安全头**：`X-Frame-Options` / `X-Content-Type-Options` / `X-XSS-Protection` / `Referrer-Policy` / `Permissions-Policy`

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

| 优化项           | 实现方式                        | 效果                         |
| ---------------- | ------------------------------- | ---------------------------- |
| **图片懒加载**   | Vant Lazyload 组件              | 首屏只加载可视区域图片       |
| **分类导航滑动** | `flex: 0 0 25%` + `scroll-snap` | 一行固定 4 个，滑动吸附对齐  |
| **路由切换动画** | `transition` + `fade-slide`     | 页面切换流畅过渡             |
| **首屏骨架屏**   | `ConfirmSkeleton` 等占位组件    | 数据加载前避免白屏闪烁       |
| **PWA 离线缓存** | Service Worker（Network First） | 生产环境离线可访问，弱网兜底 |

### 稳定性优化

| 优化项               | 实现方式                                           | 效果                                  |
| -------------------- | -------------------------------------------------- | ------------------------------------- |
| **全局错误边界**     | `ErrorBoundary` + `onErrorCaptured` 捕获渲染异常   | 子组件崩溃时降级 UI，不白屏，支持重试 |
| **组件卸载取消请求** | `useAbortController` 在 `onBeforeUnmount` 中 abort | 避免卸载后 setState，防止内存泄漏     |
| **待付款超时清理**   | `pendingPayment` store 定时扫描 + 过期自动归档     | 防止僵尸订单堆积，购物车角标准确      |

### 构建产物

```
dist/assets/
├── vue-vendor-*.js          112 KB (gzip: 44 KB)   # Vue + Router + Pinia
├── vant-vendor-*.js         134 KB (gzip: 47 KB)   # Vant 组件库
├── index-*.js               72 KB  (gzip: 26 KB)   # 应用入口 + 路由 + Web Vitals
├── info-*.js                36 KB  (gzip: 15 KB)   # 商品详情（含 SkuPanel）
├── index-*.js (order)       11 KB  (gzip: 4.4 KB)  # 订单列表
├── confirm-*.js             7.6 KB (gzip: 3.6 KB)  # 确认订单（含 ConfirmSkeleton）
├── list-*.js                7 KB   (gzip: 3 KB)    # 商品列表
├── home-*.js                5.1 KB (gzip: 2.3 KB)  # 首页
└── ...                      其余 chunk 均 < 5 KB，按需加载
```

> 业务 chunk 最大 36 KB（商品详情），首屏仅加载 vue-vendor + vant-vendor + index + home ≈ 327 KB（gzip ≈ 119 KB）。

---

## 💼 业务模块

### 用户认证

- 手机号 + 密码注册/登录
- 登录状态持久化（localStorage）
- 未登录路由拦截（全局守卫 + `checkLogin` 校验）

**关键文件**: [`login.vue`](src/views/login.vue) · [`user.ts`](src/stores/user.ts) · [`index.ts`](src/router/index.ts)

### 地址管理

- 收货地址 CRUD、默认地址切换
- 省市区三级联动（@vant/area-data）
- 下单场景地址选择（带返回参数）

**关键文件**: [`address/`](src/views/user/address/) · [`user.ts`](src/stores/user.ts)

### 商品浏览

- 首页数据展示 + 5 分钟 TTL 缓存
- 分类筛选 + 关键词搜索（防抖 + 互斥）
- 商品列表分页加载 + keep-alive 缓存恢复
- 商品详情（图片预览、加入购物车、立即购买）

**关键文件**: [`home.vue`](src/views/home.vue) · [`list.vue`](src/views/product/list.vue) · [`info.vue`](src/views/product/info.vue) · [`cache.ts`](src/utils/cache.ts) · [`debounce.ts`](src/utils/debounce.ts)

### 购物车

- 商品数量调整、单选/全选、删除
- 实时总价计算、批量结算跳转
- 待付款商品自动隐藏，`useCartBadge` 统一计算底部导航 Badge（后端全量 - 待付款占用）

**关键文件**: [`cart/index.vue`](src/views/cart/index.vue) · [`cart/confirm.vue`](src/views/cart/confirm.vue) · [`cart.ts`](src/stores/cart.ts) · [`useCartBadge.ts`](src/hooks/useCartBadge.ts)

### 订单管理

- 多状态 Tab 筛选 + 待支付 30 分钟倒计时
- 提交时本地化、支付时才真下单（适配后端无待付款状态的业务模型）
- 待支付订单自动清理过期记录
- 物流查询、确认收货、商品评价、申请售后

**关键文件**: [`order/`](src/views/order/) · [`pendingPayment.ts`](src/stores/pendingPayment.ts) · [`order.ts`](src/constants/order.ts) · [`useCountdown.ts`](src/hooks/useCountdown.ts)

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
  const isProd = mode === 'production'
  return {
    plugins: [
      vue(),
      Components({ resolvers: [VantResolver()] }), // Vant 按需导入
      isProd &&
        compression({
          // 生产环境：Brotli + Gzip 预压缩
          algorithms: ['brotliCompress', 'gzip'],
          exclude: [/\.html$/, /\.map$/],
          deleteOriginalAssets: false,
          threshold: 1024
        }),
      isProd &&
        visualizer({
          // 生产环境：产物分析
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false
        })
    ].filter(Boolean),
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' // 关闭生产环境水合警告
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

参见 [`docker/nginx.conf`](docker/nginx.conf)（含安全头、SPA fallback、API 代理、Brotli/Gzip 预压缩、静态资源长缓存）。关键配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vue_shop/dist;
    index index.html;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA fallback（index.html 禁止缓存）
    location / {
        try_files $uri $uri/ /index.html;
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        }
    }

    # API 反向代理
    location /shop/ {
        proxy_pass http://your-backend.com/index.php/shop/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 30s;
    }

    # Brotli / Gzip 预压缩
    brotli_static on;
    gzip_static on;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 静态资源长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

项目已包含 [`Dockerfile`](docker/Dockerfile) + [`nginx.conf`](docker/nginx.conf)，可直接构建运行：

```bash
# 构建镜像
docker build -f docker/Dockerfile -t vue-shop .

# 启动容器
docker run -d -p 80:80 --name vue-shop vue-shop
```

构建流程：`npm ci → type-check → test → build → nginx serve`（仅单元测试，E2E 需浏览器环境不在此运行），含健康检查端点 `/`。

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
