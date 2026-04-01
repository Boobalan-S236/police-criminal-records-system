import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
})

// Request interceptor: attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        if (!config.headers) config.headers = {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 -> remove token and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error?.response?.status === 401) {
        try {
          localStorage.removeItem('token')
        } catch (e) {}
        // Redirect user to login page
        window.location.href = '/login'
      }
    } catch (e) {
      // swallow
    }
    return Promise.reject(error)
  }
)

export default api
