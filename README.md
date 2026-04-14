# 🛒 Vue Shop - 移动端电商商城项目

[![Vue](https://img.shields.io/badge/Vue-3.2.47-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-blue.svg)](https://vitejs.dev/)
[![Vant](https://img.shields.io/badge/Vant-4.6.0-orange.svg)](https://vant-ui.github.io/vant/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

本项目是一个基于 **Vue 3** + **Vite** + **Vant 4** 开发的移动端电商商城系统。采用响应式设计，完美适配各类移动端设备。

## ✨ 项目特性

- 🚀 **现代化技术栈**: 使用 Vue 3 (Composition API) 和 Vite 构建，享受极致的开发体验。
- 📱 **移动优先**: 基于 Vant 4 UI 组件库，提供原生般的移动端交互体验。
- 🔐 **全流程购物**: 涵盖从登录注册、商品浏览、加入购物车到订单支付、物流追踪、评价的全流程。
- 🛠️ **模块化架构**: 清晰的代码组织结构，易于维护和扩展。
- 🚦 **路由鉴权**: 完善的路由守卫机制，保护用户隐私和数据安全。

## 🛠️ 技术选型

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite 4](https://vitejs.dev/)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **UI 组件库**: [Vant 4](https://vant-ui.github.io/vant/)
- **网络请求**: [Axios](https://axios-http.com/) (封装了请求拦截与响应拦截)
- **状态管理**: 路由与组件间通信
- **存储方案**: [vue3-cookies](https://github.com/cmp-cc/vue3-cookies)

## 📂 项目结构

```text
vue_shop/
├── public/              # 静态资源 (CSS, 字体, 图片)
├── src/
│   ├── components/      # 业务组件
│   │   ├── business/    # 个人中心、地址管理相关
│   │   ├── cart/        # 购物车与结算相关
│   │   ├── order/       # 订单管理相关
│   │   ├── product/     # 商品列表与详情
│   │   └── common/      # 通用组件 (如菜单)
│   ├── routers/         # 路由配置
│   ├── services/        # 网络请求封装 (axios)
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── index.html           # HTML 模板
├── package.json         # 项目依赖与脚本
└── vite.config.js       # Vite 配置文件
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/vue_shop.git
cd vue_shop
```

### 2. 安装依赖
```bash
npm install
# 或者使用 yarn
yarn install
```

### 3. 本地开发
```bash
npm run dev
```
启动后访问 `http://localhost:5173` (具体端口见终端输出)。

### 4. 项目打包
```bash
npm run build
```
打包后的文件将生成在 `dist` 目录下。

## 📝 核心功能说明

- **用户系统**: 支持注册、登录、个人信息修改、邮箱绑定。
- **地址管理**: 完整的收货地址增删改查功能，集成 `@vant/area-data` 城市选择。
- **商品中心**: 商品分类浏览、搜索、详情展示。
- **购物车**: 支持添加/删除商品、修改数量、选中结算。
- **订单系统**: 确认下单、订单列表展示、物流状态追踪、商品评价。

## 🤝 贡献指南

欢迎任何形式的贡献！你可以：
1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。
