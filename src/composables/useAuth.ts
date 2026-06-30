import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const user = computed(() => userStore.user)
  const isAdmin = computed(() => userStore.isAdmin)
  const isTeacher = computed(() => userStore.isTeacher)
  const isStudent = computed(() => userStore.isStudent)
  const loading = computed(() => userStore.loading)

  const login = async (username: string, password: string) => {
    const success = await userStore.login({ username, password })
    if (success) {
      ElMessage.success('登录成功')
      router.push('/')
    }
    return success
  }

  const register = async (data: {
    username: string
    password: string
    confirmPassword: string
    nickname: string
    email: string
    role: string
  }) => {
    const success = await userStore.register(data)
    if (success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
    return success
  }

  const logout = async () => {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }

  return {
    isLoggedIn,
    user,
    isAdmin,
    isTeacher,
    isStudent,
    loading,
    login,
    register,
    logout
  }
}
