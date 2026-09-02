import axios from 'axios'

// Backend-ready Axios instance. Swap VITE_API_BASE_URL to point at the
// Laravel REST API; every store already calls through this layer so no
// component code needs to change when dummy data is replaced by real calls.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careconnect-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('careconnect-token')
    }
    return Promise.reject(error)
  }
)

export default api
