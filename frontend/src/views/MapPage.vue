<template>
  <div class="map-page">
    <div class="page-header">
      <h1>舆图寻药</h1>
      <p class="subtitle">探索道地药材产区，点击标记了解产地生态与历史</p>
    </div>
    <MapView />
    <div class="legend">
      <div class="legend-item">
        <span class="dot"></span>
        <span>药材产区</span>
      </div>
      <div class="legend-item">
        <span class="dot" style="background: #7170ff;"></span>
        <span>已收录详情</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import MapView from '@/components/MapView.vue'
import { onMounted } from 'vue'
import { useHerbStore } from '@/stores/herbStore'

const herbStore = useHerbStore()

onMounted(() => {
  if (!herbStore.producingAreas.length) {
    herbStore.fetchProducingAreas()
  }
})
</script>

<style scoped>
.map-page {
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
.legend {
  display: flex;
  gap: var(--space-6);
  margin-top: var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--border-subtle);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-secondary);
}
.dot {
  width: 10px;
  height: 10px;
  background: var(--brand-accent);
  border-radius: 50%;
  display: inline-block;
}
</style>