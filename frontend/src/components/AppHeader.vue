<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-area">
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
        <button class="ghost-btn">登录</button>
        <button class="primary-btn">开始探索</button>
      </div>
    </div>
  </header>
</template>

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
  gap: var(--space-3);
}
.ghost-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 6px 14px;
  font-size: 13px;
}
.primary-btn {
  background: var(--brand-indigo);
  border: none;
  color: white;
  padding: 6px 14px;
  font-size: 13px;
}
.primary-btn:hover {
  background: var(--brand-hover);
}
@media (max-width: 640px) {
  .nav-links {
    display: none;
  }
}
.router-link-active {
  color: var(--text-primary);
  position: relative;
}
.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--brand-indigo);
}
</style>