import axios from 'axios'

// 从环境变量读取后端地址（开发环境使用本地，生产环境使用 Railway）
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动添加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || '网络错误，请稍后重试'
    // 可触发全局 toast
    console.error('API Error:', message)
    return Promise.reject({ message })
  }
)

export default api