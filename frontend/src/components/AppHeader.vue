<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-area" @click="router.push('/')" style="cursor: pointer;">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span class="logo-text">药境·舆图</span>
      </div>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/map" class="nav-link">舆图寻药</router-link>
        <router-link to="/herbs" class="nav-link">药典智库</router-link>
        <router-link to="/timespace" class="nav-link">时空对话</router-link>
        <router-link to="/ai" class="nav-link">AI问药</router-link>
      </nav>
      <div class="header-actions">
        <template v-if="userStore.isLoggedIn">
          <router-link to="/user" class="user-avatar">
            {{ userStore.currentUser?.nickname?.charAt(0) || userStore.currentUser?.username?.charAt(0) }}
          </router-link>
          <button @click="handleLogout" class="logout-header-btn">退出</button>
        </template>
        <template v-else>
          <button @click="showAuthModal = true" class="ghost-btn">登录</button>
          <button @click="showAuthModal = true" class="primary-btn">注册</button>
        </template>
      </div>
    </div>
    <AuthModal v-model:visible="showAuthModal" @success="onAuthSuccess" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
const userStore = useUserStore()
const showAuthModal = ref(false)

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function onAuthSuccess() {
  // 登录成功后可刷新页面数据
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 16, 17, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
}
.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.logo {
  height: 32px;
  width: auto;
}
.logo-text {
  font-weight: 590;
  font-size: 18px;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.nav-links {
  display: flex;
  gap: var(--space-6);
}
.nav-link {
  font-size: 14px;
  font-weight: 510;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.ghost-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}
.primary-btn {
  background: var(--brand-indigo);
  border: none;
  color: white;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}
.primary-btn:hover {
  background: var(--brand-hover);
}
.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--bg-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 510;
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid var(--border-subtle);
}
.logout-header-btn {
  background: transparent;
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  cursor: pointer;
}
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>