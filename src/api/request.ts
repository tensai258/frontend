import axios, { AxiosError, AxiosResponse, CreateAxiosDefaults } from 'axios'
import { ElMessage } from 'element-plus'
import { storage } from '@/utils/storage'

interface CustomAxiosInstance {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
}

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
} as CreateAxiosDefaults)

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = storage.get<string>('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data
    if (code === 200 || code === 0) {
      return data
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error: AxiosError) => {
    const { response } = error
    if (response) {
      const { status, data } = response
      if (data && (data as any).message) {
        ElMessage.error((data as any).message)
      } else {
        switch (status) {
          case 401:
            ElMessage.error('登录已过期，请重新登录')
            storage.remove('token')
            storage.remove('user')
            window.location.href = '/login'
            break
          case 403:
            ElMessage.error('没有权限访问')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器内部错误')
            break
          default:
            ElMessage.error('网络错误')
        }
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

const request = http as unknown as CustomAxiosInstance

export default request
