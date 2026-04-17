<template>
  <div class="toast-container">
    <div v-for="toast in toastStore.toasts" :key="toast.id" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}
.toast {
  background: #1a1b1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 510;
  color: #f7f8f8;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  pointer-events: auto;
  animation: toastIn 0.2s ease;
}
.toast.info {
  background: #1a1b1e;
}
.toast.success {
  background: #10b981;
}
.toast.error {
  background: #ef4444;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>