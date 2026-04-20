<template>
  <div class="herb-detail" v-if="herb">
    <div class="detail-header">
      <button class="back-btn" @click="router.back()">← 返回列表</button>
      <button 
        v-if="userStore.isLoggedIn" 
        class="favorite-btn" 
        :class="{ favorited: isFavorited }"
        @click="toggleFavorite"
      >
        {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
      </button>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHerbStore } from '@/stores/herbStore'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const herbStore = useHerbStore()
const userStore = useUserStore()
const toastStore = useToastStore()
const herb = ref(null)

const isFavorited = computed(() => userStore.favoriteHerbIds.includes(herb.value?.id))

onMounted(async () => {
  const id = parseInt(route.params.id)
  await herbStore.fetchHerbs()
  herb.value = herbStore.herbs.find(h => h.id === id)
})

const toggleFavorite = async () => {
  if (!herb.value) return
  if (!userStore.isLoggedIn) {
    toastStore.addToast('请先登录后再收藏', 'info', 2000)
    window.dispatchEvent(new CustomEvent('open-auth-modal'))
    return
  }
  await userStore.toggleFavorite(herb.value.id)
  toastStore.addToast(isFavorited.value ? '已添加至收藏' : '已取消收藏', 'success', 1500)
}
</script>

<style scoped>
.herb-detail {
  max-width: 1000px;
  margin: 0 auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}
.back-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  padding-left: 0;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.back-btn:hover {
  color: var(--text-primary);
}
.favorite-btn {
  background: transparent;
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 6px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.favorite-btn.favorited {
  background: rgba(94,106,210,0.2);
  border-color: var(--brand-indigo);
  color: var(--brand-indigo);
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