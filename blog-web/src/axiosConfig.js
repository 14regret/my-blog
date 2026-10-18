import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000
})

// 请求拦截器：每次发请求前，自动从本地拿 Token 塞进 Header 里
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：如果后端返回 401，说明没登录，强制跳转登录页
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      alert('登录已过期，请重新登录！')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request