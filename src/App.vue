<template>
  <router-view v-slot="{ Component }">
    <!-- 路由切换动画（按方向）+ 异步路由 fallback + 缓存（meta.keepAlive 控制） -->
    <transition :name="transitionName" mode="out-in">
      <suspense>
        <main id="main-content">
          <ErrorBoundary>
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </ErrorBoundary>
        </main>
        <template #fallback>
          <div class="page-loading">
            <van-loading type="spinner" color="#FF464E" />
          </div>
        </template>
      </suspense>
    </transition>
  </router-view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

const router = useRouter()

// 仅缓存 meta.keepAlive 为 true 的路由，组件 name 须与路由 name 一致
const cachedViews = computed(() =>
  router
    .getRoutes()
    .filter(r => r.meta?.keepAlive)
    .map(r => r.name)
)

// 路由切换方向：通过历史栈判断前进/后退，驱动动画方向
const historyStack = ref([router.currentRoute.value.path])
const transitionName = ref('slide-left')

router.afterEach(to => {
  const stack = historyStack.value
  const index = stack.indexOf(to.path)
  if (index > -1) {
    // 后退：回退到栈中已有页面
    stack.splice(index + 1)
    transitionName.value = 'slide-right'
  } else if (to.path !== stack[stack.length - 1]) {
    // 前进：压入新页面
    stack.push(to.path)
    transitionName.value = 'slide-left'
  }
})
</script>

<style>
/* 路由切换动画 - 前进（左滑） */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
/* 路由切换动画 - 后退（右滑） */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 异步路由加载占位 */
.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-color);
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 按钮主题色阴影 */
.van-button--primary {
  box-shadow: 0 4px 12px rgba(255, 70, 78, 0.2) !important;
}
</style>
