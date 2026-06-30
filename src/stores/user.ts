import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { authApi } from '@/api/modules/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(storage.get<string>('token'))
  const user = ref<User | null>(storage.get<User>('user'))
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isStudent = computed(() => user.value?.role === 'student')

  // Actions
  const setAuth = (authToken: string, authUser: User) => {
    token.value = authToken
    user.value = authUser
    storage.set('token', authToken)
    storage.set('user', authUser)
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    storage.remove('token')
    storage.remove('user')
  }

  const login = async (credentials: { username: string; password: string }) => {
    loading.value = true
    try {
      const res: any = await authApi.login(credentials)
      const authToken = res.accessToken || res.token
      setAuth(authToken, res.user)
      return true
    } finally {
      loading.value = false
    }
  }

  const register = async (data: {
    username: string
    password: string
    confirmPassword: string
    nickname: string
    email: string
    role: string
  }) => {
    loading.value = true
    try {
      await authApi.register(data)
      return true
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await authApi.getCurrentUser()
      user.value = res
      storage.set('user', res)
    } catch {
      clearAuth()
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    const res = await authApi.updateProfile(data)
    user.value = res
    storage.set('user', res)
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    isAdmin,
    isTeacher,
    isStudent,
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile
  }
})
