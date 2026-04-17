<template>
  <div class="app-wrapper">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-marketing);
}
.main-content {
  flex: 1;
  max-width: 1280px;
  width: 90%;
  margin: 0 auto;
  padding: var(--space-8) 0 var(--space-12);
}
@media (max-width: 768px) {
  .main-content {
    width: 95%;
    padding-top: var(--space-6);
  }
}
</style>