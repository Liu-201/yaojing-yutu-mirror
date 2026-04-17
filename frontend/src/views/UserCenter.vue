<template>
  <div class="user-center">
    <div v-if="!userStore.isLoggedIn" class="not-logged-in">
      <p>请先登录</p>
      <button @click="showAuthModal = true" class="login-btn">去登录</button>
    </div>
    <div v-else>
      <div class="profile-header">
        <div class="avatar">
          {{ userStore.currentUser?.nickname?.charAt(0) || 'U' }}
        </div>
        <div class="info">
          <h2>{{ userStore.currentUser?.nickname || userStore.currentUser?.username }}</h2>
          <p>@{{ userStore.currentUser?.username }}</p>
        </div>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'favorites' }]" @click="activeTab = 'favorites'">
          我的收藏
        </button>
        <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">
          问答历史
        </button>
      </div>
      <div class="tab-content">
        <div v-if="activeTab === 'favorites'" class="favorites-list">
          <div v-if="favoriteHerbs.length === 0" class="empty-state">
            暂无收藏，去 <router-link to="/herbs">药典智库</router-link> 添加吧～
          </div>
          <div v-else class="herb-grid">
            <HerbCard
              v-for="herb in favoriteHerbs"
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
        </div>
        <div v-if="activeTab === 'history'" class="history-list">
          <div v-if="userStore.qaHistory.length === 0" class="empty-state">
            暂无问答记录，去 <router-link to="/ai">AI问药</router-link> 试试～
          </div>
          <div v-else>
            <button @click="clearHistory" class="clear-btn">清空历史</button>
            <div v-for="record in userStore.qaHistory" :key="record.id" class="history-item">
              <div class="question">问：{{ record.question }}</div>
              <div class="answer" v-html="record.answer"></div>
              <div class="time">{{ formatTime(record.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AuthModal v-model:visible="showAuthModal" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useHerbStore } from '@/stores/herbStore'
import AuthModal from '@/components/AuthModal.vue'
import HerbCard from '@/components/HerbCard.vue'

const router = useRouter()
const userStore = useUserStore()
const herbStore = useHerbStore()
const showAuthModal = ref(false)
const activeTab = ref('favorites')

// 收藏的药材详情
const favoriteHerbs = computed(() => {
  if (!herbStore.herbs.length) return []
  return herbStore.herbs.filter(h => userStore.favoriteHerbIds.includes(h.id))
})

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function clearHistory() {
  if (confirm('确定要清空所有问答历史吗？')) {
    userStore.clearQaHistory()
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function goToDetail(id) {
  router.push(`/herbs/${id}`)
}

function onAuthSuccess() {
  // 登录成功后重新加载页面内容
}

onMounted(async () => {
  if (!herbStore.herbs.length) {
    await herbStore.fetchHerbs()
  }
})
</script>

<style scoped>
.user-center {
  max-width: 1000px;
  margin: 8vh auto 4vh auto;
  padding: 0 var(--space-4);
}
.not-logged-in {
  text-align: center;
  padding: var(--space-12);
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
}
.not-logged-in p {
  margin-bottom: var(--space-4);
  color: var(--text-tertiary);
}
.login-btn {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 20px;
  color: white;
  cursor: pointer;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}
.avatar {
  width: 64px;
  height: 64px;
  background: var(--bg-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 510;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
}
.info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 590;
}
.info p {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 13px;
}
.logout-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 6px 14px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}
.logout-btn:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}
.tabs {
  display: flex;
  gap: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-6);
}
.tab {
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 15px;
  font-weight: 510;
  color: var(--text-tertiary);
  cursor: pointer;
}
.tab.active {
  color: var(--text-primary);
  border-bottom: 2px solid var(--brand-indigo);
}
.favorites-list {
  min-height: 300px;
}
.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}
.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-tertiary);
}
.empty-state a {
  color: var(--brand-accent);
  text-decoration: underline;
}
.history-list {
  max-height: 500px;
  overflow-y: auto;
}
.clear-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  font-size: 12px;
  margin-bottom: var(--space-4);
  cursor: pointer;
}
.history-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.question {
  font-weight: 590;
  margin-bottom: 8px;
  color: var(--text-primary);
}
.answer {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
}
.time {
  font-size: 11px;
  color: var(--text-quaternary);
  text-align: right;
}
</style>