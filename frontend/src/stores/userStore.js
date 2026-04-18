import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const favoriteHerbIds = ref([])
  const qaHistory = ref([])

  const isLoggedIn = computed(() => currentUser.value !== null)

  // 初始化：从 localStorage 读取
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

  // 存储数据到 localStorage
  function persist() {
    if (currentUser.value) {
      localStorage.setItem('yaojing_user', JSON.stringify(currentUser.value))
    } else {
      localStorage.removeItem('yaojing_user')
    }
    localStorage.setItem('yaojing_favorites', JSON.stringify(favoriteHerbIds.value))
    localStorage.setItem('yaojing_qa_history', JSON.stringify(qaHistory.value))
  }

  // 模拟用户数据库（实际应从后端获取）
  let users = []

  // 从 localStorage 加载已有用户
  function loadUsers() {
    const stored = localStorage.getItem('yaojing_users')
    if (stored) {
      users = JSON.parse(stored)
    } else {
      // 预置测试用户
      users = [
        { id: 1, username: 'testuser', nickname: '测试用户', phone: '13800138000', password: '123456', avatar: null }
      ]
      saveUsers()
    }
  }

  function saveUsers() {
    localStorage.setItem('yaojing_users', JSON.stringify(users))
  }

  // 登录
  async function login(account, credential, type) {
    loadUsers()
    if (type === 'password') {
      const user = users.find(u => u.phone === account && u.password === credential)
      if (user) {
        currentUser.value = { ...user }
        persist()
        return { success: true }
      } else {
        return { success: false, message: '手机号或密码错误' }
      }
    } else if (type === 'sms') {
      // 验证码登录，credential 为验证码，模拟验证码为 123456
      if (credential !== '123456') {
        return { success: false, message: '验证码错误' }
      }
      const user = users.find(u => u.phone === account)
      if (user) {
        currentUser.value = { ...user }
        persist()
        return { success: true }
      } else {
        return { success: false, message: '手机号未注册' }
      }
    }
    return { success: false, message: '登录失败' }
  }

  // 注册
  async function register({ username, phone, password, code }) {
    loadUsers()
    if (code !== '123456') {
      return { success: false, message: '验证码错误' }
    }
    if (users.find(u => u.phone === phone)) {
      return { success: false, message: '手机号已注册' }
    }
    if (users.find(u => u.username === username)) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: Date.now(),
      username,
      nickname: username,
      phone,
      password,
      avatar: null
    }
    users.push(newUser)
    saveUsers()
    // 自动登录
    currentUser.value = { ...newUser }
    persist()
    return { success: true }
  }

  // 检查手机号是否存在
  function checkPhoneExists(phone) {
    loadUsers()
    return users.some(u => u.phone === phone)
  }

  // 重置密码
  async function resetPassword(phone, newPassword) {
    loadUsers()
    const user = users.find(u => u.phone === phone)
    if (user) {
      user.password = newPassword
      saveUsers()
      return { success: true }
    }
    return { success: false, message: '用户不存在' }
  }

  // 更新个人资料
async function updateProfile({ nickname, avatar }) {
  if (!currentUser.value) return { success: false }
  const userIndex = users.findIndex(u => u.id === currentUser.value.id)
  if (userIndex !== -1) {
    if (nickname !== undefined) users[userIndex].nickname = nickname
    if (avatar !== undefined) users[userIndex].avatar = avatar
    saveUsers()
    currentUser.value = { ...users[userIndex] }
    persist()
    return { success: true }
  }
  return { success: false }
}

  // 修改密码
  async function changePassword(oldPassword, newPassword) {
    if (!currentUser.value) return { success: false }
    const user = users.find(u => u.id === currentUser.value.id)
    if (user && user.password === oldPassword) {
      user.password = newPassword
      saveUsers()
      currentUser.value = { ...user }
      persist()
      return { success: true }
    }
    return { success: false, message: '原密码错误' }
  }

  // 退出登录
  function logout() {
    currentUser.value = null
    persist()
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
    qaHistory.value.unshift(record)
    if (qaHistory.value.length > 50) qaHistory.value = qaHistory.value.slice(0, 50)
    localStorage.setItem('yaojing_qa_history', JSON.stringify(qaHistory.value))
  }

  // 清空问答历史
  function clearQaHistory() {
    qaHistory.value = []
    localStorage.removeItem('yaojing_qa_history')
  }

  initFromStorage()

  return {
    currentUser,
    favoriteHerbIds,
    qaHistory,
    isLoggedIn,
    login,
    register,
    logout,
    checkPhoneExists,
    resetPassword,
    updateProfile,
    changePassword,
    toggleFavorite,
    addQaRecord,
    clearQaHistory
  }
})