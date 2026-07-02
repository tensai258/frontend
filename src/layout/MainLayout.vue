<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, logout, isAdmin } = useAuth()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

const menuItems = computed(() => {
  if (user.value?.role === 'student') {
    return [
      { path: '/student', title: '学习中心', icon: 'HomeFilled' }
    ]
  }

  const dashboardPath =
    user.value?.role === 'teacher' ? '/dashboard/teacher' :
    user.value?.role === 'admin' ? '/dashboard/admin' :
    '/dashboard/student'

  return [
    { path: dashboardPath, title: '工作台', icon: 'HomeFilled' },
    { path: '/chat', title: '智能答疑', icon: 'ChatDotRound' },
    { path: '/assignments', title: '作业中心', icon: 'Document' },
    { path: '/analysis/student', title: '学情分析', icon: 'TrendCharts' },
    ...(isAdmin.value ? [{ path: '/admin', title: '管理后台', icon: 'Setting' }] : [])
  ]
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    logout()
  } else if (command === 'profile') {
    // 可扩展个人资料页面
  }
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const setRoleTheme = (role: string | undefined) => {
  document.documentElement.dataset.role = role || 'student'
}

watch(() => user.value?.role, setRoleTheme, { immediate: true })
</script>

<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#fff"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">智学伴行</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部Header -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="user?.avatar" class="user-avatar">
                {{ user?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ user?.nickname || user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin-left: 12px;
  white-space: nowrap;
}

:deep(.el-menu) {
  border-right: none;
  flex: 1;
}

:deep(.el-menu-item) {
  font-size: 15px;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.15) !important;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
