import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const favoriteHerbIds = ref([])
  const qaHistory = ref([])

  const isLoggedIn = computed(() => currentUser.value !== null)

  // 从后端获取当前用户信息（根据 token）
  async function fetchUser() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const user = await api.get('/user/profile')
      currentUser.value = user
    } catch (err) {
      // token 无效，清除本地存储
      localStorage.removeItem('token')
      currentUser.value = null
    }
  }

  // 获取收藏列表
  async function fetchFavorites() {
    if (!isLoggedIn.value) return
    try {
      const ids = await api.get('/user/favorites')
      favoriteHerbIds.value = ids
    } catch (err) {
      console.error('获取收藏失败', err)
    }
  }

  // 获取问答历史
  async function fetchQaHistory() {
    if (!isLoggedIn.value) return
    try {
      const history = await api.get('/user/qa-history')
      // 后端返回的 refs 可能是 JSON 字符串，需解析
      qaHistory.value = history.map(item => ({
        ...item,
        refs: typeof item.refs === 'string' ? JSON.parse(item.refs) : (item.refs || [])
      }))
    } catch (err) {
      console.error('获取问答历史失败', err)
    }
  }

  // 登录（密码或验证码）
  async function login(account, credential, type) {
    try {
      let endpoint, payload
      if (type === 'password') {
        endpoint = '/auth/login/password'
        payload = { phone: account, password: credential }
      } else {
        endpoint = '/auth/login/sms'
        payload = { phone: account, code: credential }
      }
      const res = await api.post(endpoint, payload)
      // res 结构: { token, user }
      localStorage.setItem('token', res.token)
      currentUser.value = res.user
      // 登录成功后拉取收藏和历史
      await fetchFavorites()
      await fetchQaHistory()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || '登录失败' }
    }
  }

  // 注册
  async function register({ username, phone, password, code }) {
    try {
      const res = await api.post('/auth/register', { username, phone, password, code })
      localStorage.setItem('token', res.token)
      currentUser.value = res.user
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || '注册失败' }
    }
  }

  // 退出登录
  function logout() {
    currentUser.value = null
    favoriteHerbIds.value = []
    qaHistory.value = []
    localStorage.removeItem('token')
  }

  // 检查手机号是否存在（用于忘记密码）
  async function checkPhoneExists(phone) {
    // 后端可提供一个专用接口，这里简单调用登录接口尝试获取用户（不验证密码）
    // 为简化，直接返回 true，实际项目中建议添加 /auth/check-phone 接口
    return true
  }

  // 重置密码
  async function resetPassword(phone, newPassword) {
    // 需要后端提供 /auth/reset-password 接口，演示时使用模拟
    try {
      // 模拟实现：实际应调用后端
      // const res = await api.post('/auth/reset-password', { phone, newPassword })
      // return { success: true }
      return { success: false, message: '该功能暂未开放，请联系管理员' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 更新个人资料（昵称、头像）
  async function updateProfile({ nickname, avatar }) {
    if (!isLoggedIn.value) return { success: false, message: '未登录' }
    try {
      await api.put('/user/profile', { nickname, avatar })
      if (nickname !== undefined) currentUser.value.nickname = nickname
      if (avatar !== undefined) currentUser.value.avatar = avatar
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || '更新失败' }
    }
  }

  // 修改密码
  async function changePassword(oldPassword, newPassword) {
    if (!isLoggedIn.value) return { success: false, message: '未登录' }
    try {
      await api.put('/user/password', { oldPassword, newPassword })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || '密码修改失败' }
    }
  }

  // 切换收藏
  async function toggleFavorite(herbId) {
    if (!isLoggedIn.value) return
    const isFav = favoriteHerbIds.value.includes(herbId)
    try {
      if (isFav) {
        await api.delete(`/user/favorites/${herbId}`)
        favoriteHerbIds.value = favoriteHerbIds.value.filter(id => id !== herbId)
      } else {
        await api.post('/user/favorites', { herbId })
        favoriteHerbIds.value.push(herbId)
      }
    } catch (err) {
      console.error('切换收藏失败', err)
    }
  }

  // 添加问答记录
  async function addQaRecord(question, answer, refs = []) {
    if (!isLoggedIn.value) return
    try {
      await api.post('/user/qa-history', { question, answer, refs })
      // 可选：重新拉取历史记录以保持同步
      await fetchQaHistory()
    } catch (err) {
      console.error('保存问答记录失败', err)
    }
  }

  // 清空问答历史
  async function clearQaHistory() {
    if (!isLoggedIn.value) return
    try {
      await api.delete('/user/qa-history')
      qaHistory.value = []
    } catch (err) {
      console.error('清空历史失败', err)
    }
  }

  // 初始化：尝试自动登录（token 存在时获取用户信息）
  const init = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await fetchUser()
      if (currentUser.value) {
        await fetchFavorites()
        await fetchQaHistory()
      }
    }
  }
  init()

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
    clearQaHistory,
    fetchFavorites,
    fetchQaHistory
  }
})