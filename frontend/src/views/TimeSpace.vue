<template>
  <div class="time-space-page">
    <div class="page-header">
      <h1>时空对话</h1>
      <p class="subtitle">追溯道地药材产区的历史变迁，感受千年药香流转</p>
    </div>
    <TimelineMap />
    <div class="cultural-note">
      <h3>党参产区的千年之旅</h3>
      <p>党参最早记载于《神农本草经》，当时以上党（今山西长治）为道地产区。随着气候变化、土地开垦和医药需求的增长，产区逐渐西移至甘肃、四川等地。明代以后，甘肃岷县、渭源成为新的党参之乡。这种迁移不仅反映了自然环境的演变，也见证了中医药文化的传播与交融。</p>
      <p class="ref">—— 据《本草纲目》《中药材生产区划》整理</p>
    </div>
  </div>
</template>

<script setup>
import TimelineMap from '@/components/TimelineMap.vue'
</script>

<style scoped>
.time-space-page {
  max-width: 1280px;
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
  margin-bottom: var(--space-4);
}
.cultural-note {
  margin-top: var(--space-8);
  padding: var(--space-6);
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
}
.cultural-note h3 {
  font-size: 20px;
  font-weight: 590;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}
.cultural-note p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-2);
}
.ref {
  font-size: 12px;
  color: var(--text-quaternary);
  margin-top: var(--space-3);
}
</style>