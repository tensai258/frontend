import request from '../request'
import type { LoginForm, RegisterForm, User } from '@/types'

export const authApi = {
  login(data: LoginForm) {
    return request.post<{ accessToken: string; refreshToken: string; expiresIn: number; user: User }>('/auth/login', data)
  },

  register(data: RegisterForm) {
    const { confirmPassword, ...registerData } = data
    return request.post<{ message: string }>('/auth/register', registerData)
  },

  logout() {
    return request.post('/auth/logout')
  },

  getCurrentUser() {
    return request.get<User>('/auth/me')
  },

  refreshToken(refreshToken: string) {
    return request.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh',
      {},
      { headers: { 'X-Refresh-Token': refreshToken } }
    )
  },

  updateProfile(data: Partial<User>) {
    return request.put<User>('/auth/profile', data)
  },

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return request.post('/auth/change-password', data)
  }
}
