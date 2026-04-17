<template>
  <div class="herb-card" @click="emit('click')">
    <div class="card-image">
      <img :src="image" :alt="name" />
    </div>
    <div class="card-content">
      <h3 class="herb-name">{{ name }}</h3>
      <p class="herb-latin">{{ latinName }}</p>
      <div class="card-footer">
        <span class="herb-effect">{{ effectShort }}</span>
        <StatusBadge :status="status" />
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  id: [Number, String],
  name: String,
  latinName: String,
  image: String,
  effectShort: String,
  status: String   // 'common', 'rare', 'protected'
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.herb-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
}
.herb-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}
.card-image {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--bg-surface);
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-content {
  padding: var(--space-4);
}
.herb-name {
  font-size: 18px;
  font-weight: 590;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.herb-latin {
  font-size: 12px;
  color: var(--text-quaternary);
  font-family: var(--font-mono);
  margin-bottom: var(--space-3);
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.herb-effect {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.4;
}
</style>