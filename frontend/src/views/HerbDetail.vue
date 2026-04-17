<template>
  <div class="herb-detail" v-if="herb">
        <div class="detail-header">
            <button class="back-btn" @click="router.back()">← 返回列表</button>
        </div>

        <div class="detail-grid">
        <div class="detail-image">
            <img :src="herb.image" :alt="herb.name" />
        </div>

        <div class="detail-info">
            <h1>{{ herb.name }}</h1>
            <p class="latin-name">{{ herb.latinName }}</p>
        <div class="tags">
            <span class="tag">{{ herb.categoryLabel }}</span>
            <StatusBadge :status="herb.status" />
        </div>

        <div class="info-section">
            <h3>性味归经</h3>
            <p>{{ herb.propertyFlavor }}</p>
        </div>

        <div class="info-section">
            <h3>功效主治</h3>
            <p>{{ herb.effects }}</p>
        </div>

        <div class="info-section">
            <h3>道地产区</h3>
            <p>{{ herb.producingArea }}</p>
        </div>

        <div class="info-section" v-if="herb.chemicalComposition">
            <h3>主要成分</h3>
            <p>{{ herb.chemicalComposition }}</p>
        </div>

        <div class="detail-header">
            <button class="back-btn" @click="router.back()">← 返回列表</button>
            <button v-if="userStore.isLoggedIn" class="favorite-btn" @click="toggleFavorite">
                {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
            </button>
        </div>
      </div>
    </div>
    <div class="extra-section" v-if="herb.historicalStory">
      <h3>历史典故</h3>
      <p>{{ herb.historicalStory }}</p>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHerbStore } from '@/stores/herbStore'
import StatusBadge from '@/components/StatusBadge.vue'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const herbStore = useHerbStore()
const herb = ref(null)
const userStore = useUserStore()
const isFavorited = computed(() => userStore.favoriteHerbIds.includes(herb.value?.id))

onMounted(async () => {
  const id = parseInt(route.params.id)
  await herbStore.fetchHerbs()
  herb.value = herbStore.herbs.find(h => h.id === id)
})
function toggleFavorite() {
  if (herb.value) {
    userStore.toggleFavorite(herb.value.id)
  }
}
</script>

<style scoped>
.herb-detail {
  max-width: 1000px;
  margin: 0 auto;
}
.detail-header {
  margin-bottom: var(--space-6);
}
.back-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  padding-left: 0;
  font-size: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--space-8);
  margin-bottom: var(--space-10);
}
.detail-image img {
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
  background: var(--bg-surface);
}
.latin-name {
  font-family: var(--font-mono);
  color: var(--text-quaternary);
  font-size: 14px;
  margin-bottom: var(--space-4);
}
.tags {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}
.tag {
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-full);
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 510;
}
.info-section {
  margin-bottom: var(--space-5);
}
.info-section h3 {
  font-size: 16px;
  font-weight: 590;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}
.info-section p {
  color: var(--text-tertiary);
  line-height: 1.6;
}
.extra-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-6);
}
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>