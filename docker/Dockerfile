# ──────────────────── Build Stage ────────────────────
FROM node:20-alpine AS build-stage
WORKDIR /app

# 利用 Docker 层缓存：先装依赖，再复制源码
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run type-check && npm run test && npm run build

# ──────────────────── Serve Stage ────────────────────
FROM nginx:alpine AS serve-stage

# 注入自定义 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
