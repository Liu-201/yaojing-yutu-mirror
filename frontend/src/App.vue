<template>
  <div class="app-wrapper">
    <div class="aurora-bg" ref="auroraBg"></div>
    <div class="noise-overlay"></div>
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useReveal } from '@/composables/useReveal'

const auroraBg = ref(null)
let scrollHandler = null

// 视差滚动效果：只让背景层缓慢移动，前景不动（保证导航栏 sticky 正常工作）
onMounted(() => {
  scrollHandler = () => {
    if (!auroraBg.value) return
    const scrollY = window.scrollY
    // 背景层移动速度为滚动距离的 30%，产生视差感，但不影响布局
    auroraBg.value.style.transform = `translateY(${scrollY * 0.3}px)`
  }
  window.addEventListener('scroll', scrollHandler)

  // 初始化滚动显示动画（Reveal on Scroll）
  // 注意：此函数应在 DOM 元素出现后调用，但内部使用 IntersectionObserver 动态观察，可接受
  useReveal()
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<style scoped>
.app-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-marketing);
}

/* 动态弥散光背景（Aurora Gradient） - 改为 fixed 并允许缓慢移动 */
.aurora-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;  /* 略高于视口，避免移动时露出底部空白 */
  z-index: -2;
  background: radial-gradient(circle at 20% 30%, rgba(94, 106, 210, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(113, 112, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(130, 143, 255, 0.08) 0%, transparent 60%);
  animation: auroraMove 20s ease infinite alternate;
  pointer-events: none;
  will-change: transform;
}

@keyframes auroraMove {
  0% {
    transform: scale(1) translate(0%, 0%);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05) translate(2%, 1%);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1) translate(-1%, 2%);
    opacity: 0.6;
  }
}

/* 白色噪点纹理层 */
.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

/* 页面切换转场动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 主内容区域 - 正常滚动，不受背景视差影响 */
.main-content {
  flex: 1;
  max-width: 1280px;
  width: 90%;
  margin: 0 auto;
  padding: var(--space-8) 0 var(--space-12);
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .main-content {
    width: 95%;
    padding-top: var(--space-6);
  }
}
</style>