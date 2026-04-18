<template>
  <div class="app-wrapper">
    <DotField
      :dotRadius="1.5"
      :dotSpacing="16"
      :bulgeStrength="55"
      :glowRadius="180"
      :sparkle="false"
      :waveAmplitude="0"
      gradientFrom="rgba(94, 106, 210, 0.35)"
      gradientTo="rgba(113, 112, 255, 0.25)"
      glowColor="#120F17"
    />

    <PillNav
      :logo="logoUrl"
      logoAlt="药境舆图"
      :items="navItems"
      baseColor="#0f1011"
      pillColor="#191a1b"
      hoveredPillTextColor="#f7f8f8"
      pillTextColor="#d0d6e0"
      activePillColor="#5e6ad2"
      activePillTextColor="#ffffff"
      :initialLoadAnimation="true"
    />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />
    <ToastContainer />
    
    <!-- 登录/注册弹窗（仅在用户主动点击登录或访问个人中心时触发） -->
    <AuthModal v-model:visible="showAuthModal" @success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DotField from '@/components/DotField.vue'
import PillNav from '@/components/PillNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import AuthModal from '@/components/AuthModal.vue'
import { useReveal } from '@/composables/useReveal'
import logoUrl from '@/assets/logo.svg'

const showAuthModal = ref(false)

const navItems = [
  { label: '首页', href: '/' },
  { label: '舆图寻药', href: '/map' },
  { label: '药典智库', href: '/herbs' },
  { label: '时空对话', href: '/timespace' },
  { label: 'AI问药', href: '/ai' }
]

// 监听全局登录弹窗事件（例如从个人中心组件触发）
const handleOpenAuthModal = () => {
  showAuthModal.value = true
}

// 登录成功后的回调（可选，用于刷新用户状态）
const onLoginSuccess = () => {
  // 登录成功后，可刷新当前页面或重新加载用户数据
  location.reload()
}

onMounted(() => {
  useReveal()
  window.addEventListener('open-auth-modal', handleOpenAuthModal)
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

.main-content {
  flex: 1;
  max-width: 1280px;
  width: 90%;
  margin: 0 auto;
  padding: calc(var(--space-8) + 60px) 0 var(--space-12);
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .main-content {
    width: 95%;
    padding-top: calc(var(--space-6) + 60px);
  }
}
</style>