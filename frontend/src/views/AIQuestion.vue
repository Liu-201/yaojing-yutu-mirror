<template>
  <div class="ai-question-page">
    <div class="page-header">
      <h1>AI 问药</h1>
      <p class="subtitle">智能问答助手，道地药材知识一网打尽</p>
    </div>
    <AIChat />
  </div>
</template>

<script setup>
import AIChat from '@/components/AIChat.vue'
</script>

<style scoped>
.ai-question-page {
  max-width: 1000px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: var(--space-6);
}
h1 {
  font-size: 32px;
  font-weight: 510;
  letter-spacing: -0.704px;
  margin-bottom: var(--space-2);
}
.subtitle {
  color: var(--text-tertiary);
}
</style>