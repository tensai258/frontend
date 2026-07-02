<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/student/questions', label: '题库中心', icon: 'Collection' },
  { path: '/student/assignments', label: '作业中心', icon: 'Document' },
  { path: '/student/wrong-qs', label: '错题集', icon: 'WarningFilled' },
  { path: '/student/recommend', label: '个性化推荐', icon: 'MagicStick' },
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
</script>

<template>
  <div class="student-layout">
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
    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.student-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: var(--dashboard-primary);
}

.tab-item.active {
  color: var(--dashboard-primary);
  border-bottom-color: var(--dashboard-primary);
  font-weight: 600;
}

.tab-content {
  flex: 1;
  padding: var(--spacing);
  overflow-y: auto;
}
</style>
