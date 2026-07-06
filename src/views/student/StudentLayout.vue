<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

const tabs = [
  { path: '/student/questions', label: '题库中心', icon: 'Collection' },
  { path: '/student/assignments', label: '作业中心', icon: 'Document' },
  { path: '/student/wrong-qs', label: '错题集', icon: 'WarningFilled' },
  { path: '/student/knowledge-graph', label: '知识图谱', icon: 'Connection' },
  { path: '/student/recommend', label: '智能推荐', icon: 'MagicStick' },
  { path: '/student/review', label: '复习回顾', icon: 'Timer' },
  { path: '/student/analysis', label: '学情分析', icon: 'DataAnalysis' },
  { path: '/student/chat', label: '智能答疑', icon: 'ChatDotRound' }
]

const activeTab = ref(route.path)

watch(() => route.path, (val) => {
  const matched = tabs.find(t => val.startsWith(t.path))
  if (matched) activeTab.value = matched.path
})

const handleTabClick = (path: string) => {
  router.push(path)
}

const roleLabel = (role?: string) => {
  const map: Record<string, string> = { student: '学生', teacher: '教师', admin: '管理员' }
  return map[role || ''] || role || '用户'
}

const handleLogout = () => {
  logout()
}
</script>

<template>
  <div class="student-layout">
    <header class="layout-header">
      <div class="header-left">
        <el-icon :size="24" color="#409EFF"><School /></el-icon>
        <span class="header-title">智学伴行</span>
      </div>
      <div class="tab-bar">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ active: activeTab === tab.path }"
          @click="handleTabClick(tab.path)"
        >
          <el-icon :size="16"><component :is="tab.icon" /></el-icon>
          <span>{{ tab.label }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleLogout">
          <span class="user-info">
            <el-avatar :size="30" class="user-avatar">
              {{ user?.nickname?.charAt(0) || user?.username?.charAt(0) || 'U' }}
            </el-avatar>
            <span class="username">{{ user?.nickname || user?.username || '用户' }}</span>
            <el-tag size="small" type="info">{{ roleLabel(user?.role) }}</el-tag>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.student-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.layout-header {
  display: flex;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 16px;
  height: 56px;
  z-index: 10;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.tab-bar {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: #409EFF;
}

.tab-item.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
  font-weight: 600;
}

.header-right {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background: linear-gradient(135deg, #409EFF, #5B8FF9);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style>
