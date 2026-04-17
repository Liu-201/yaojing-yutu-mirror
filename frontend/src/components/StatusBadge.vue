<template>
  <span :class="['status-badge', statusClass]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'common'
  }
})

const labelMap = {
  common: '常见',
  rare: '稀有',
  protected: '保护'
}

const label = computed(() => labelMap[props.status] || '常见')

const statusClass = computed(() => {
  if (props.status === 'protected') return 'status-protected'
  if (props.status === 'rare') return 'status-rare'
  return 'status-common'
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 510;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}
.status-protected {
  background: rgba(39, 166, 68, 0.15);
  color: var(--success-green);
  border-color: rgba(39, 166, 68, 0.3);
}
.status-rare {
  background: rgba(255, 179, 71, 0.1);
  color: #ffb347;
}
</style>