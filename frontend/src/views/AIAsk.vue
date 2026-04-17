<template>
  <div class="ai-ask-page">
    <div class="page-header">
      <h1>AI问药</h1>
      <p class="subtitle">智能问答 · 道地药材知识助手</p>
    </div>
    <div class="chat-container">
      <AIChat />
    </div>
    <div class="disclaimer">
      <p>🤖 回答基于《中国药典》及公开文献生成，仅供参考，不构成医疗建议。</p>
    </div>
  </div>
</template>

<script setup>
import AIChat from '@/components/AIChat.vue'
</script>

<style scoped>
.ai-ask-page {
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
.chat-container {
  margin: var(--space-4) 0;
}
.disclaimer {
  margin-top: var(--space-6);
  text-align: center;
  font-size: 12px;
  color: var(--text-quaternary);
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-4);
}
</style>