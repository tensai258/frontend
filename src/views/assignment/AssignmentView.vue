<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { assignmentApi } from '@/api/modules/assignment'
import type { Assignment } from '@/types'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const assignments = ref<Assignment[]>([])
const loading = ref(false)
const filterStatus = ref('')
const filterSubject = ref('')
const subjects = ref<string[]>([])

// Load submitted assignments from localStorage
const getSubmittedStatus = (id: number): boolean => {
  try {
    const item = localStorage.getItem(`submitted_${id}`)
    return item !== null
  } catch {
    return false
  }
}

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '草稿', value: 'DRAFT' },
  { label: '已关闭', value: 'CLOSED' }
]

const statusMap: Record<string, { type: 'primary' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  PUBLISHED: { type: 'primary', label: '已发布' },
  DRAFT: { type: 'info', label: '草稿' },
  CLOSED: { type: 'warning', label: '已关闭' }
}

const getSubject = (item: Assignment) => item.courseName || item.subject || '未知课程'
const getDeadline = (item: Assignment) => item.endTime || item.deadline || ''
const isExpired = (item: Assignment) => {
  const deadline = getDeadline(item)
  if (!deadline) return false
  return new Date(deadline).getTime() < Date.now()
}

const loadAssignments = async () => {
  loading.value = true
  try {
    const res = await assignmentApi.getAssignments({
      page: 1,
      size: 20
    })
    assignments.value = res.list || []
  } catch {
    ElMessage.error('加载作业失败，请确保后端服务已启动')
  } finally {
    loading.value = false
  }
}

const loadSubjects = async () => {
  try {
    const res = await assignmentApi.getSubjects()
    subjects.value = res as unknown as string[]
  } catch {
    subjects.value = ['数据结构', '高等数学', '操作系统', '计算机网络']
  }
}

const goDetail = (id: number) => {
  router.push(`/assignments/${id}`)
}

const getDeadlineColor = (deadline: string, status: string) => {
  if (status === 'overdue') return '#F56C6C'
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 1) return '#F56C6C'
  if (days <= 3) return '#E6A23C'
  return '#67C23A'
}

const getDeadlineText = (deadline: string, status: string) => {
  if (status === 'overdue') return '已逾期'
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return '已逾期'
  if (days === 0) return '今天截止'
  return `还剩 ${days} 天`
}

onMounted(() => {
  loadAssignments()
  loadSubjects()
})
</script>

<template>
  <div class="assignment-view">
    <PageHeader title="作业中心" description="查看和管理你的作业任务" />

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">状态：</span>
          <el-radio-group v-model="filterStatus" size="small" @change="loadAssignments">
            <el-radio-button v-for="opt in statusOptions" :key="opt.value" :label="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-group">
          <span class="filter-label">科目：</span>
          <el-select
            v-model="filterSubject"
            placeholder="全部科目"
            clearable
            size="small"
            style="width: 140px"
            @change="loadAssignments"
          >
            <el-option
              v-for="s in subjects"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 作业列表 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col
        v-for="item in assignments"
        :key="item.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        class="assignment-col"
      >
        <el-card class="assignment-card" shadow="hover" @click="goDetail(item.id)">
          <div class="card-header">
            <el-tag :type="statusMap[item.status || '']?.type || 'info'" size="small">
              {{ statusMap[item.status || '']?.label || item.status }}
            </el-tag>
            <span class="subject-tag">{{ getSubject(item) }}</span>
            <el-tag
              v-if="userStore.isStudent && getSubmittedStatus(item.id)"
              type="success"
              size="small"
              effect="plain"
              style="margin-left: auto;"
            >已提交</el-tag>
          </div>
          <h3 class="assignment-title">{{ item.title }}</h3>
          <p class="assignment-desc">{{ item.description }}</p>
          <div class="assignment-meta">
            <div class="meta-item">
              <el-icon><Timer /></el-icon>
              <span :style="{ color: getDeadlineColor(getDeadline(item), isExpired(item) ? 'overdue' : 'pending') }">
                {{ getDeadlineText(getDeadline(item), isExpired(item) ? 'overdue' : 'pending') }}
              </span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ item.teacherName }}</span>
            </div>
          </div>
          <div v-if="item.score !== undefined" class="score-bar">
            <el-progress
              :percentage="Math.round((item.score / (item.totalScore || 100)) * 100)"
              :status="item.score >= 60 ? 'success' : 'exception'"
            />
            <span class="score-text">{{ item.score }}/{{ item.totalScore || 100 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col v-if="assignments.length === 0 && !loading" :span="24">
        <el-empty description="暂无作业" />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.assignment-view {
  padding-bottom: 40px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.assignment-col {
  margin-bottom: 16px;
}

.assignment-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  border: 1px solid #f0f0f0;
}

.assignment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.subject-tag {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 3px 10px;
  border-radius: 6px;
}

.assignment-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.assignment-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.score-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar :deep(.el-progress) {
  flex: 1;
}

.score-text {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}
</style>
