# 🛒 Vue Shop - 移动端电商项目

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vant-4.x-07C160?style=flat-square&logo=vant&logoColor=white" alt="Vant" />
  <img src="https://img.shields.io/badge/Pinia-3.x-F9A825?style=flat-square&logo=pinia&logoColor=white" alt="Pinia" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

<p align="center">
  <strong>基于 Vue 3 + Vite + Vant 构建的现代化移动端商城解决方案</strong>
</p>

---

## 📖 目录

- [✨ 项目简介](#-项目简介)
- [🎯 核心特性](#-核心特性)
- [🛠️ 技术栈](#️-技术栈)
- [📦 快速开始](#-快速开始)
- [🏗️ 项目架构](#️-项目架构)
- [📁 项目结构](#-项目结构)
- [💼 业务模块](#-业务模块)
- [⚙️ 配置说明](#️-配置说明)
- [🚀 部署指南](#-部署指南)
- [🔧 开发规范](#-开发规范)
- [❓ 常见问题](#-常见问题)
- [📄 许可证](#-许可证)

---

## ✨ 项目简介

Vue Shop 是一个功能完善的**移动端电商前端项目**，采用现代化的前端技术栈构建，覆盖从用户注册登录、商品浏览、购物车管理、订单处理到售后服务的完整电商业务闭环。

### 🎨 设计理念

- **用户体验优先**: 流畅的交互体验，符合移动端操作习惯
- **组件化开发**: 高度模块化，易于维护和扩展
- **性能优化**: 懒加载、缓存策略、代码分割等优化手段
- **代码规范**: 统一的 JSDoc 注释标准和代码风格

---

## 🎯 核心特性

### 用户系统
- 🔐 手机号注册/登录
- 👤 个人资料管理（头像、昵称、邮箱验证）
- 📍 多地址管理（增删改查、默认地址设置）

### 商品模块
- 🏠 首页展示（轮播图、分类导航、热门推荐）
- 📋 商品列表（分类筛选、搜索、分页加载）
- 🔍 商品详情（图片预览、规格选择、客服联系）
- 🛒 购物车功能（数量调整、商品删除、全选结算）

### 订单系统
- 📝 订单创建（地址选择、备注填写、金额计算）
- 💳 支付流程（立即支付、稍后支付、支付状态跟踪）
- 📊 订单管理（全部订单、待支付、待发货、待收货等状态筛选）
- 🚚 物流查询（实时物流信息展示）
- ⭐ 商品评价（图文评价、评分系统）
- 🔄 售后服务（退货申请、退款处理）

### 技术亮点
- ⚡ Vite 构建工具，极速的开发体验
- 🎭 Vue 3 Composition API，更灵活的代码组织
- 🗂️ Pinia 状态管理，轻量高效
- 📱 Vant UI 组件库，专业的移动端 UI 方案
- 🔄 Axios 请求封装，统一的错误处理
- 💾 本地缓存策略，提升页面加载速度

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue.js](https://vuejs.org/) | ^3.2.47 | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | ^4.3.9 | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | ^4.2.2 | 官方路由管理器 |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.4 | Vue 状态管理库 |
| [Vant](https://vant-ui.github.io/) | ^4.6.0 | 移动端 UI 组件库 |
| [Axios](https://axios-http.com/) | ^1.4.0 | HTTP 客户端 |
| [@vant/area-data](https://github.com/vant-ui/vant) | ^1.4.1 | 省市区数据 |

---

## 📦 快速开始

### 📋 环境要求

- **Node.js**: >= 16.x (推荐 18 LTS)
- **npm**: >= 8.x
- **浏览器**: Chrome 90+ / Safari 14+ / Firefox 88+

### 🚀 安装步骤

#### 1. 克隆项目

```bash
git clone <your-repository-url>
cd vue_shop
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:6060 查看应用

#### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

#### 5. 预览生产构建

```bash
npm run preview
```

---

## 🏗️ 项目架构

### 架构设计原则

```
┌─────────────────────────────────────────┐
│              View Layer                 │
│    (Components / Pages)                 │
├─────────────────────────────────────────┤
│            State Management             │
│         (Pinia Stores)                  │
├─────────────────────────────────────────┤
│           Service Layer                 │
│      (API Requests / Utils)             │
├─────────────────────────────────────────┤
│            Infrastructure               │
│     (Router / Config / Constants)       │
└─────────────────────────────────────────┘
```

### 数据流设计

```
User Action → Component → Store → API Service → Backend API
     ↓              ↓          ↓           ↓
   Update UI ← Response ← Update State ← Return Data
```

---

## 📁 项目结构

```
vue_shop/
├── public/                          # 静态资源
│   ├── fonts/                      # 字体文件
│   ├── images/                     # 图片资源
│   └── jaiju.ico                   # 网站图标
│
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── common.css          # 全局样式
│   │
│   ├── components/                 # 组件目录
│   │   ├── business/               # 业务组件（个人中心）
│   │   │   ├── index.vue           # 个人中心首页
│   │   │   ├── profile.vue         # 个人资料编辑
│   │   │   ├── email.vue           # 邮箱验证
│   │   │   └── address/            # 地址管理
│   │   │       ├── add.vue         # 新增地址
│   │   │       ├── edit.vue        # 编辑地址
│   │   │       └── index.vue       # 地址列表
│   │   │
│   │   ├── cart/                   # 购物车模块
│   │   │   ├── index.vue           # 购物车列表
│   │   │   └── confirm.vue         # 结算页面
│   │   │
│   │   ├── order/                  # 订单模块
│   │   │   ├── index.vue           # 订单列表
│   │   │   ├── info.vue            # 订单详情
│   │   │   ├── express.vue         # 物流信息
│   │   │   └── eveluate.vue        # 评价页面
│   │   │
│   │   ├── product/                # 商品模块
│   │   │   ├── list.vue            # 商品列表
│   │   │   └── info.vue            # 商品详情
│   │   │
│   │   ├── common/                 # 公共组件
│   │   │   └── Menu.vue            # 底部导航栏
│   │   │
│   │   ├── home.vue                # 首页
│   │   ├── login.vue               # 登录页
│   │   └── register.vue            # 注册页
│   │
│   ├── constants/                  # 常量定义
│   │   └── order.js                # 订单状态常量
│   │
│   ├── routers/                    # 路由配置
│   │   └── index.js                # 路由定义与守卫
│   │
│   ├── services/                   # 服务层
│   │   └── request.js              # HTTP 请求封装
│   │
│   ├── stores/                     # 状态管理
│   │   ├── user.js                 # 用户状态
│   │   ├── cart.js                 # 购物车状态
│   │   ├── pendingPayment.js       # 待支付订单状态
│   │   └── completedLocalOrders.js # 已完成本地订单
│   │
│   ├── utils/                      # 工具函数
│   │   ├── result.js               # 业务结果判断
│   │   ├── currency.js             # 金额格式化
│   │   ├── params.js               # 参数处理
│   │   ├── cache.js                # 缓存管理
│   │   ├── clipboard.js            # 复制功能
│   │   └── countdown.js            # 倒计时工具
│   │
│   ├── App.vue                     # 根组件
│   └── main.js                     # 应用入口
│
├── .gitignore                      # Git 忽略配置
├── index.html                      # HTML 入口文件
├── package.json                    # 项目依赖配置
├── vite.config.js                  # Vite 配置文件
└── README.md                       # 项目文档
```

---

## 💼 业务模块

### 1️⃣ 用户认证模块

**功能范围：**
- 手机号 + 密码注册/登录
- 登录状态持久化（LocalStorage）
- 未登录路由拦截（Navigation Guards）
- 自动跳转已登录用户

**关键流程：**
```
访问受保护页面 → 检测登录状态 → 未登录 → 重定向至登录页
                                        ↓
                              输入手机号/密码 → 提交 → 验证成功 → 存储用户信息 → 跳转目标页
```

**相关文件：**
- [`login.vue`](src/components/login.vue) - 登录页面
- [`register.vue`](src/components/register.vue) - 注册页面
- [`user.js`](src/stores/user.js) - 用户状态管理
- [`index.js (routers)`](src/routers/index.js) - 路由守卫

---

### 2️⃣ 地址管理模块

**功能范围：**
- 收货地址 CRUD 操作
- 默认地址设置与切换
- 下单场景地址选择（带返回参数）
- 地址数量限制（最多 10 个）
- 省市区三级联动（@vant/area-data）

**数据流：**
```
地址列表页 → 选择/编辑/新增 → 地址操作 → 更新列表 → 回传选中地址（下单场景）
```

**相关文件：**
- [`address/index.vue`](src/components/business/address/index.vue) - 地址列表
- [`address/add.vue`](src/components/business/address/add.vue) - 新增地址
- [`address/edit.vue`](src/components/business/address/edit.vue) - 编辑地址

---

### 3️⃣ 商品浏览模块

**功能范围：**
- 首页数据展示（分类、推荐、热门）
- 分类筛选与商品搜索
- 商品列表分页加载
- 商品详情展示（图片、价格、规格）
- 加入购物车 / 立即购买
- 客服电话拨打
- 图片预览功能

**性能优化：**
- 首页数据缓存（5 分钟 TTL）
- 图片懒加载
- 列表滚动位置记忆

**相关文件：**
- [`home.vue`](src/components/home.vue) - 首页
- [`product/list.vue`](src/components/product/list.vue) - 商品列表
- [`product/info.vue`](src/components/product/info.vue) - 商品详情
- [`cache.js`](src/utils/cache.js) - 缓存工具

---

### 4️⃣ 购物车模块

**功能范围：**
- 购物车商品列表展示
- 商品数量调整（步进器）
- 单选 / 全选 / 反选
- 商品删除（二次确认）
- 实时总价计算
- 批量结算跳转

**状态同步：**
```
购物车操作 → 后端接口 → 返回最新数据 → 更新购物车Store → 同步底部导航Badge
```

**相关文件：**
- [`cart/index.vue`](src/components/cart/index.vue) - 购物车列表
- [`cart/confirm.vue`](src/components/cart/confirm.vue) - 结算页面
- [`cart.js`](src/stores/cart.js) - 购物车状态管理

---

### 5️⃣ 订单管理系统

**功能范围：**

#### 订单创建流程
```
商品确认 → 选择地址 → 填写备注 → 提交订单 → 支付确认 → 订单完成
```

#### 订单状态流转
```
待支付 (-2) → 待发货 (2) → 待收货 (3) → 待评价 (4) → 已完成 (5)
    ↓           ↓
  已取消 (6)   申请售后
```

#### 核心功能
- **订单列表**：分页加载、状态 Tab 筛选、倒计时显示（待支付）
- **订单详情**：商品信息、物流追踪、订单操作
- **支付流程**：
  - 支持本地模拟支付（用于演示）
  - 服务端真实支付接口对接
  - 支付失败/取消的友好提示
- **订单操作**：
  - 取消订单（动画过渡效果）
  - 确认收货
  - 申请售后
  - 商品评价
  - 物流查询
  - 催发货

**特殊处理：**
- 待支付订单倒计时（30 分钟超时自动清理）
- 本地订单存储（支持离线查看已完成订单）
- 订单列表状态缓存（滚动位置、Tab 状态）

**相关文件：**
- [`order/index.vue`](src/components/order/index.vue) - 订单列表
- [`order/info.vue`](src/components/order/info.vue) - 订单详情
- [`order/express.vue`](src/components/order/express.vue) - 物流信息
- [`order/eveluate.vue`](src/components/order/eveluate.vue) - 评价页面
- [`pendingPayment.js`](src/stores/pendingPayment.js) - 待支付订单状态
- [`completedLocalOrders.js`](src/stores/completedLocalOrders.js) - 本地订单状态
- [`order.js`](src/constants/order.js) - 订单常量定义
- [`countdown.js`](src/utils/countdown.js) - 倒计时工具

---

## ⚙️ 配置说明

### 开发环境配置 ([`vite.config.js`](vite.config.js))

```javascript
export default defineConfig({
  server: {
    port: 6060,  // 开发服务器端口
    proxy: {
      '/shop': {                    // API 代理前缀
        target: 'http://www.fastadmin.com',  // 后端服务地址
        changeOrigin: true,         // 允许跨域
        rewrite: (path) => path.replace(/^\/shop/, '/index.php/shop')  // 路径重写
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')  // 路径别名
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],  // Vue 生态分包
          'vant-vendor': ['vant']                         // Vant UI 分包
        }
      }
    }
  }
})
```

### 修改后端接口地址

编辑 [`vite.config.js`](vite.config.js) 中的 `proxy` 配置：

```javascript
proxy: {
  '/shop': {
    target: 'https://your-backend-api.com',  // 修改为你的后端地址
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/shop/, '/api/shop')  // 根据实际路径调整
  }
}
```

---

## 🚀 部署指南

### Nginx 部署示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源目录
    root /var/www/vue_shop/dist;
    index index.html;

    # Vue Router History 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /shop/ {
        proxy_pass http://www.fastadmin.com/index.php/shop/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持（如需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署（可选）

```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：
```bash
docker build -t vue-shop .
docker run -d -p 80:80 vue-shop
```

---

## 🔧 开发规范

### 代码规范

#### JSDoc 注释标准

所有 JavaScript 函数必须使用 JSDoc 格式注释：

```javascript
/**
 * 函数简述
 * @param {Type} paramName - 参数说明
 * @returns {Type} 返回值说明
 */
const functionName = async (param) => {
  // 实现
}

/** 变量或属性说明 */
const importantVar = ref(null)
```

#### 工具函数使用约定

| 场景 | 使用工具 | 位置 |
|------|---------|------|
| 业务结果判断 | `isBizFail()` / `isBizSuccess()` | `utils/result.js` |
| 参数提取与处理 | `getRouteQueryValue()` / `normalizeIdList()` | `utils/params.js` |
| 金额格式化 | `formatCurrency()` / `toFen()` / `roundToTwo()` | `utils/currency.js` |
| 缓存操作 | `getCache()` / `setCache()` | `utils/cache.js` |
| 复制功能 | `copyToClipboard()` | `utils/clipboard.js` |
| 倒计时 | `getRemainingTime()` / `isPaymentExpired()` | `utils/countdown.js` |
| 订单状态 | `getOrderStatusText()` / `getOrderStatusClass()` | `constants/order.js` |

### Git 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链变更

**示例：**
```bash
feat(order): 添加订单导出功能
fix(cart): 修复购物车数量计算错误
docs(readme): 更新部署说明
```

### 分支策略

```
main (生产环境)
  ↑
develop (开发环境)
  ↑
feature/* (功能分支)
hotfix/* (紧急修复分支)
```

---

## ❓ 常见问题

### Q1: 为什么有些接口名称看起来不正确？

**A:** 为了兼容历史后端接口，部分接口保留了原始命名（如 `eveluate`、`conrce`）。这些命名虽然不符合现代规范，但为了保持与后端的兼容性而保留。不建议随意修改。

### Q2: 缓存数据什么时候会失效？

**A:** 
- 会话级缓存（`sessionStorage`）：关闭浏览器标签页后失效
- 带 TTL 的缓存：超过设定时间后失效（如首页缓存 5 分钟）
- LocalStorage 缓存：手动清除或调用清除方法时失效

### Q3: 待支付订单的倒计时是如何工作的？

**A:** 
- 基于 `countdown.js` 工具函数实现
- 从订单创建时间开始计时
- 默认 30 分钟超时（可配置）
- 超时后自动从列表中移除
- 页面可见时启动定时器，不可见时暂停以节省资源

### Q4: 如何切换到自己的后端服务？

**A:** 
1. 编辑 `vite.config.js` 文件
2. 修改 `server.proxy['/shop'].target` 为你的后端地址
3. 调整 `rewrite` 规则以匹配你的 API 路径
4. 重启开发服务器

### Q5: 生产环境如何配置 API 地址？

**A:** 
- 通过 Nginx 反向代理配置（推荐）
- 或在构建时通过环境变量注入
- 或使用相对路径让前端自动继承当前域名

---

## 📊 性能优化记录

### 已实施的优化措施

| 优化项 | 实现方式 | 效果 |
|--------|---------|------|
| **代码分割** | Vite 手动分包（Vue/Vant） | 减少主包体积 ~40% |
| **图片懒加载** | Vant Lazyload 组件 | 首屏加载时间减少 ~30% |
| **数据缓存** | sessionStorage + TTL | 重复访问秒开 |
| **路由懒加载** | Vue Router 动态 import | 初始加载体积减小 ~50% |
| **Gzip 压缩** | Nginx 配置 | 传输体积减少 ~70% |
| **资源缓存** | 浏览器缓存策略 | 回访用户零等待 |
| **防抖节流** | 关键操作限制 | 防止重复提交 |

### 构建产物分析

```
dist/assets/
├── vue-vendor-*.js          ~104 KB (Vue 生态)
├── vant-vendor-*.js         ~220 KB (Vant UI)
├── index-*.js               ~49 KB (业务主包)
├── confirm-*.js             ~8 KB (结算页)
├── index-*.css              ~208 KB (全局样式)
└── ...                       其他按需加载的 chunk
```

**总构建大小**: ~600 KB (Gzip 后 ~150 KB)

---

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出建议！

### 如何贡献

1. **Fork** 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 代码审查清单

- [ ] 代码遵循项目规范
- [ ] 所有函数都有 JSDoc 注释
- [ ] 无 console.log 调试代码
- [ ] 新增功能有对应的测试（如有）
- [ ] 文档已更新（如有必要）

### Bug 反馈

请使用 GitHub Issues 提交 Bug，并提供以下信息：

- **问题描述**: 清晰描述问题现象
- **复现步骤**: 详细的重现步骤
- **期望行为**: 您期望的正确行为
- **环境信息**: 浏览器版本、Node 版本等
- **截图/日志**: 相关的错误信息或截图

---

## 📈 项目路线图

### v1.0 (Current) ✅
- [x] 用户认证系统
- [x] 商品浏览与搜索
- [x] 购物车管理
- [x] 订单完整流程
- [x] 地址管理
- [x] 基础评价系统

### v1.1 (Planning)
- [ ] 微信支付接入
- [ ] 消息通知系统
- [ ] 商品收藏功能
- [ ] 订单搜索与筛选优化
- [ ] 暗色模式支持

### v2.0 (Future)
- [ ] PWA 支持（离线访问）
- [ ] 多语言国际化（i18n）
- [ ] 单元测试覆盖
- [ ] E2E 测试自动化
- [ ] 性能监控集成

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。

```
MIT License

Copyright (c) 2024 Vue Shop

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Vant](https://vant-ui.github.io/) - 移动端 Vue 组件库
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [FastAdmin](https://www.fastadmin.com/) - 后端框架参考

---

## 📞 联系方式

- **项目仓库**: [GitHub Repository URL]
- **问题反馈**: [GitHub Issues]
- **邮箱**: 1642612119@qq.com

---

<div align="center">

**如果这个项目对您有帮助，请给一个 ⭐ Star 支持一下！**

Made with ❤️ by [Mr_Yang]

</div>
