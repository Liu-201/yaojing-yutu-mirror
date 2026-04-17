<template>
  <div class="herb-list-page">
    <div class="page-header">
      <h1>药典智库</h1>
      <p class="subtitle">收录道地药材，溯源产地生态与历史文化</p>
      <div class="filter-bar">
        <input type="text" v-model="searchQuery" placeholder="搜索药材名、功效..." class="search-input" />
        <select v-model="categoryFilter" class="filter-select">
          <option value="all">全部分类</option>
          <option value="root">根茎类</option>
          <option value="flower">花类</option>
          <option value="fruit">果实类</option>
          <option value="whole">全草类</option>
        </select>
      </div>
    </div>
    <div class="herb-grid">
      <HerbCard
        v-for="herb in filteredHerbs"
        :key="herb.id"
        :id="herb.id"
        :name="herb.name"
        :latinName="herb.latinName"
        :image="herb.image"
        :effectShort="herb.effectShort"
        :status="herb.status"
        @click="goToDetail(herb.id)"
      />
    </div>
    <div v-if="filteredHerbs.length === 0" class="empty-state">
      <p>暂无相关药材，试试其他关键词～</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHerbStore } from '@/stores/herbStore'
import HerbCard from '@/components/HerbCard.vue'

const router = useRouter()
const herbStore = useHerbStore()

const searchQuery = ref('')
const categoryFilter = ref('all')

const filteredHerbs = computed(() => {
  let list = herbStore.herbs
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(q) || h.effectShort.toLowerCase().includes(q))
  }
  if (categoryFilter.value !== 'all') {
    list = list.filter(h => h.category === categoryFilter.value)
  }
  return list
})

function goToDetail(id) {
  router.push(`/herbs/${id}`)
}

onMounted(() => {
  // 确保 store 已加载数据
  herbStore.fetchHerbs()
})
</script>

<style scoped>
.herb-list-page {
  max-width: 1280px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: var(--space-8);
}
h1 {
  font-size: 32px;
  font-weight: 510;
  letter-spacing: -0.704px;
  margin-bottom: var(--space-2);
}
.subtitle {
  color: var(--text-tertiary);
  margin-bottom: var(--space-6);
}
.filter-bar {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}
.search-input, .filter-select {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
}
.search-input {
  flex: 1;
  min-width: 200px;
}
.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-6);
}
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-tertiary);
}
</style>