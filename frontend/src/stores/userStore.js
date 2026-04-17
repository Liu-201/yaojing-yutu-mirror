import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 当前登录用户信息
  const currentUser = ref(null)
  // 收藏的药材ID列表
  const favoriteHerbIds = ref([])
  // 问答历史记录
  const qaHistory = ref([])

  // 是否已登录
  const isLoggedIn = computed(() => currentUser.value !== null)

  // 初始化：从 localStorage 读取数据
  function initFromStorage() {
    const storedUser = localStorage.getItem('yaojing_user')
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
    }
    const storedFavs = localStorage.getItem('yaojing_favorites')
    if (storedFavs) {
      favoriteHerbIds.value = JSON.parse(storedFavs)
    }
    const storedHistory = localStorage.getItem('yaojing_qa_history')
    if (storedHistory) {
      qaHistory.value = JSON.parse(storedHistory)
    }
  }

  // 登录
  async function login(username, password) {
    // 模拟验证：硬编码一个测试账号
    if (username === 'testuser' && password === '123456') {
      const user = { id: 1, username: 'testuser', nickname: '药境旅人', avatar: null }
      currentUser.value = user
      localStorage.setItem('yaojing_user', JSON.stringify(user))
      return { success: true }
    } else {
      return { success: false, message: '用户名或密码错误（测试账号：testuser / 123456）' }
    }
  }

  // 注册
  async function register(username, password, nickname) {
    // 简单模拟：不允许重复用户名
    if (username === 'testuser') {
      return { success: false, message: '用户名已存在' }
    }
    const user = { id: Date.now(), username, nickname: nickname || username, avatar: null }
    currentUser.value = user
    localStorage.setItem('yaojing_user', JSON.stringify(user))
    return { success: true }
  }

  // 登出
  function logout() {
    currentUser.value = null
    localStorage.removeItem('yaojing_user')
    // 注意：不清除收藏和历史，让用户下次登录仍可看到
  }

  // 切换收藏
  function toggleFavorite(herbId) {
    if (favoriteHerbIds.value.includes(herbId)) {
      favoriteHerbIds.value = favoriteHerbIds.value.filter(id => id !== herbId)
    } else {
      favoriteHerbIds.value.push(herbId)
    }
    localStorage.setItem('yaojing_favorites', JSON.stringify(favoriteHerbIds.value))
  }

  // 添加问答记录
  function addQaRecord(question, answer, refs = []) {
    const record = {
      id: Date.now(),
      question,
      answer,
      refs,
      timestamp: new Date().toISOString()
    }
    qaHistory.value.unshift(record) // 最新在上
    // 保留最近50条
    if (qaHistory.value.length > 50) qaHistory.value = qaHistory.value.slice(0, 50)
    localStorage.setItem('yaojing_qa_history', JSON.stringify(qaHistory.value))
  }

  // 清空问答历史
  function clearQaHistory() {
    qaHistory.value = []
    localStorage.removeItem('yaojing_qa_history')
  }

  // 初始化
  initFromStorage()

  return {
    currentUser,
    favoriteHerbIds,
    qaHistory,
    isLoggedIn,
    login,
    register,
    logout,
    toggleFavorite,
    addQaRecord,
    clearQaHistory
  }
})