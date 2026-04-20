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
          <option value="leaf">叶类</option>
          <option value="bark">皮类</option>
          <option value="stem">茎木类</option>
          <option value="fungus">菌类</option>
          <option value="animal">动物类</option>
          <option value="mineral">矿物类</option>
          <option value="processed">加工类</option>
          <option value="seed">种子类</option>
          <option value="bulb">鳞茎类</option>
          <option value="pollen">花粉类</option>
        </select>
      </div>
    </div>

    <div class="herb-grid">
      <TiltedCard
        v-for="herb in paginatedHerbs"
        :key="herb.id"
        :imageSrc="herb.image"
        :altText="herb.name"
        :captionText="herb.name"
        containerHeight="320px"
        containerWidth="100%"
        imageHeight="280px"
        imageWidth="100%"
        :scaleOnHover="1.05"
        :rotateAmplitude="10"
        :showMobileWarning="false"
        :showTooltip="true"
        :displayOverlayContent="true"
        @click="goToDetail(herb.id)"
      >
        <template #overlay>
          <div class="card-overlay-content">
            <h3 class="herb-name">{{ herb.name }}</h3>
            <p class="herb-latin">{{ herb.latinName }}</p>
            <span class="herb-effect">{{ herb.effectShort }}</span>
          </div>
        </template>
      </TiltedCard>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">下一页</button>
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
import TiltedCard from '@/components/TiltedCard.vue'

const router = useRouter()
const herbStore = useHerbStore()

const searchQuery = ref('')
const categoryFilter = ref('all')
const currentPage = ref(1)
const pageSize = 15 // 每页显示24个（4x6网格）

// 过滤后的全部药材
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

// 分页后的数据
const paginatedHerbs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredHerbs.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredHerbs.value.length / pageSize)
})

// 当筛选条件改变时，重置到第一页
const resetPage = () => {
  currentPage.value = 1
}

// 监听筛选条件变化
import { watch } from 'vue'
watch([searchQuery, categoryFilter], () => {
  resetPage()
})

function goToDetail(id) {
  router.push(`/herbs/${id}`)
}

onMounted(async () => {
  if (!herbStore.herbs.length) {
    await herbStore.fetchHerbs()
  }
})
</script>

<style scoped>
/* 原有样式保持不变，新增分页样式 */
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
.search-input {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
  min-width: 200px;
}
.search-input:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.filter-select {
  background: var(--bg-surface, #191a1b);
  border: 1px solid var(--border-standard, rgba(255,255,255,0.08));
  border-radius: var(--radius-md, 6px);
  padding: 8px 32px 8px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary, #f7f8f8);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d0d6e0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}
.filter-select option {
  background: var(--bg-surface, #191a1b);
  color: var(--text-primary, #f7f8f8);
}
.filter-select:focus {
  outline: none;
  border-color: var(--brand-accent, #7170ff);
}
.filter-select:hover {
  background-color: var(--bg-elevated, #28282c);
}
.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}
.card-overlay-content {
  text-align: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.herb-name {
  font-size: 20px;
  font-weight: 590;
  margin-bottom: 4px;
  color: white;
}
.herb-latin {
  font-size: 12px;
  font-family: var(--font-mono);
  margin-bottom: 8px;
  opacity: 0.9;
}
.herb-effect {
  font-size: 13px;
  background: rgba(94,106,210,0.8);
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-block;
}
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-tertiary);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding: var(--space-4) 0;
}
.page-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 6px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-info {
  font-size: 14px;
  color: var(--text-tertiary);
}
</style>