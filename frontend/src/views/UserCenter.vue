<template>
  <div class="user-center">
    <!-- 未登录状态 -->
    <div v-if="!userStore.isLoggedIn" class="not-logged-in">
      <p>请先登录后查看个人中心</p>
      <button class="login-btn" @click="openLoginModal">去登录</button>
    </div>

    <!-- 已登录状态 -->
    <div v-else>
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'profile' }]" @click="activeTab = 'profile'">个人资料</button>
        <button :class="['tab', { active: activeTab === 'favorites' }]" @click="activeTab = 'favorites'">我的收藏</button>
        <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">问药记录</button>
      </div>

      <div class="tab-content">
        <!-- 个人资料 -->
        <div v-if="activeTab === 'profile'" class="profile-section">
          <div class="avatar-section">
            <div class="avatar" @click="triggerFileInput">
              <img v-if="avatarPreview" :src="avatarPreview" />
              <span v-else>{{ userStore.currentUser?.nickname?.charAt(0) || 'U' }}</span>
            </div>
            <button class="change-avatar-btn" @click="triggerFileInput">更换头像</button>
            <input
              type="file"
              ref="fileInput"
              accept="image/jpeg,image/png,image/gif"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
          <div class="info-form">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="profileForm.nickname" placeholder="昵称" />
            </div>
            <button class="save-btn" @click="updateProfile">保存修改</button>
            <div class="password-change">
              <h4>修改密码</h4>
              <div class="form-group">
                <label>原密码</label>
                <input type="password" v-model="passwordForm.oldPassword" />
              </div>
              <div class="form-group">
                <label>新密码</label>
                <input type="password" v-model="passwordForm.newPassword" />
              </div>
              <div class="form-group">
                <label>确认密码</label>
                <input type="password" v-model="passwordForm.confirmPassword" />
              </div>
              <button class="save-btn" @click="changePassword">修改密码</button>
            </div>
          </div>
        </div>

        <!-- 我的收藏 -->
        <div v-if="activeTab === 'favorites'" class="favorites-section">
          <div v-if="favoriteHerbs.length === 0" class="empty-state">暂无收藏，去药典智库添加吧～</div>
          <div class="herb-grid">
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

        <!-- 问药记录 -->
        <div v-if="activeTab === 'history'" class="history-section">
          <button v-if="userStore.qaHistory.length" class="clear-btn" @click="clearHistory">清空历史</button>
          <div v-if="userStore.qaHistory.length === 0" class="empty-state">暂无问答记录，去AI问药试试～</div>
          <div v-for="record in userStore.qaHistory" :key="record.id" class="history-item">
            <div class="question">问：{{ record.question }}</div>
            <div class="answer" v-html="record.answer"></div>
            <div class="time">{{ formatTime(record.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <AuthModal v-model:visible="showAuthModal" @success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useHerbStore } from '@/stores/herbStore'
import { useToastStore } from '@/stores/toastStore'
import HerbCard from '@/components/HerbCard.vue'
import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
const userStore = useUserStore()
const herbStore = useHerbStore()
const toastStore = useToastStore()

const activeTab = ref('profile')
const profileForm = ref({ nickname: userStore.currentUser?.nickname || '' })
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const avatarPreview = ref(userStore.currentUser?.avatar || null)
const fileInput = ref(null)
const showAuthModal = ref(false)

const favoriteHerbs = computed(() => {
  if (!herbStore.herbs.length) return []
  return herbStore.herbs.filter(h => userStore.favoriteHerbIds.includes(h.id))
})

// 打开登录弹窗
const openLoginModal = () => {
  showAuthModal.value = true
}

// 登录成功后的回调
const onLoginSuccess = () => {
  // 刷新用户信息
  profileForm.value.nickname = userStore.currentUser?.nickname || ''
  avatarPreview.value = userStore.currentUser?.avatar || null
  // 可以重新加载收藏等数据
  location.reload() // 简单刷新页面以更新所有状态
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toastStore.addToast('请选择图片文件', 'error', 2000)
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    toastStore.addToast('图片大小不能超过 2MB', 'error', 2000)
    return
  }

  const reader = new FileReader()
  reader.onload = async (ev) => {
    const base64 = ev.target.result
    avatarPreview.value = base64
    const res = await userStore.updateProfile({ avatar: base64 })
    if (res.success) {
      toastStore.addToast('头像已更新', 'success', 2000)
    } else {
      toastStore.addToast('头像更新失败', 'error', 2000)
    }
  }
  reader.readAsDataURL(file)
  fileInput.value.value = ''
}

const updateProfile = async () => {
  const res = await userStore.updateProfile({ nickname: profileForm.value.nickname })
  if (res.success) {
    toastStore.addToast('个人信息已更新', 'success', 2000)
  } else {
    toastStore.addToast('更新失败', 'error', 2000)
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toastStore.addToast('新密码与确认密码不一致', 'error', 2000)
    return
  }
  const res = await userStore.changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
  if (res.success) {
    toastStore.addToast('密码修改成功', 'success', 2000)
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    toastStore.addToast(res.message || '原密码错误', 'error', 2000)
  }
}

const clearHistory = () => {
  if (confirm('确定清空所有问答记录吗？')) {
    userStore.clearQaHistory()
    toastStore.addToast('已清空', 'success', 2000)
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const goToDetail = (id) => {
  router.push(`/herbs/${id}`)
}

onMounted(async () => {
  if (!herbStore.herbs.length) {
    await herbStore.fetchHerbs()
  }
  profileForm.value.nickname = userStore.currentUser?.nickname || ''
  avatarPreview.value = userStore.currentUser?.avatar || null
})
</script>

<style scoped>
.user-center {
  max-width: 1000px;
  margin: 0 auto;
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
.profile-section {
  display: flex;
  gap: var(--space-8);
}
.avatar-section {
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  background: var(--bg-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 590;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.change-avatar-btn {
  margin-top: 12px;
  background: transparent;
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
}
.info-form {
  flex: 1;
}
.form-group {
  margin-bottom: var(--space-4);
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 510;
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  color: var(--text-primary);
}
.save-btn {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  color: white;
  cursor: pointer;
}
.password-change {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}
.password-change h4 {
  margin-bottom: var(--space-4);
  font-size: 16px;
}
.favorites-section .herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}
.history-section .history-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.question {
  font-weight: 590;
  margin-bottom: 8px;
}
.answer {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.time {
  font-size: 11px;
  color: var(--text-quaternary);
  text-align: right;
}
.clear-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  margin-bottom: var(--space-4);
  cursor: pointer;
}
.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-tertiary);
}
.not-logged-in {
  text-align: center;
  padding: var(--space-12);
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
}
.login-btn {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 20px;
  color: white;
  cursor: pointer;
  margin-top: var(--space-4);
}
</style>