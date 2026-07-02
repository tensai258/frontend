<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { assignmentApi } from '@/api/modules/assignment'
import type { Assignment } from '@/types'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()
const assignments = ref<Assignment[]>([])
const loading = ref(false)
const filterStatus = ref('')
const filterSubject = ref('')
const subjects = ref<string[]>([])

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待完成', value: 'pending' },
  { label: '已提交', value: 'submitted' },
  { label: '已批改', value: 'graded' },
  { label: '已逾期', value: 'overdue' }
]

const statusMap: Record<string, { type: 'primary' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pending: { type: 'primary', label: '待完成' },
  submitted: { type: 'success', label: '已提交' },
  graded: { type: 'warning', label: '已批改' },
  overdue: { type: 'danger', label: '已逾期' }
}

const loadAssignments = async () => {
  loading.value = true
  try {
    const res = await assignmentApi.getAssignments({
      page: 1,
      size: 20
    })
    assignments.value = res.records || []
  } catch {
    // 后端接口失败时使用模拟数据
    assignments.value = mockAssignments
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

// 模拟数据
const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: '第一章 线性表课后作业',
    description: '完成教材P30-P35所有练习题',
    subject: '数据结构',
    deadline: '2026-07-05 23:59:00',
    status: 'pending',
    totalScore: 100,
    teacherName: '张老师'
  },
  {
    id: 2,
    title: '栈与队列编程作业',
    description: '用C语言实现顺序栈和链栈',
    subject: '数据结构',
    deadline: '2026-07-10 23:59:00',
    status: 'submitted',
    totalScore: 100,
    teacherName: '张老师'
  },
  {
    id: 3,
    title: '高数第三章测验',
    description: '微分中值定理与导数的应用',
    subject: '高等数学',
    deadline: '2026-06-25 23:59:00',
    status: 'graded',
    score: 85,
    totalScore: 100,
    teacherName: '李老师'
  },
  {
    id: 4,
    title: '二叉树遍历练习',
    description: '实现前序、中序、后序遍历',
    subject: '数据结构',
    deadline: '2026-06-20 23:59:00',
    status: 'overdue',
    totalScore: 100,
    teacherName: '张老师'
  }
]

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
            <el-tag :type="statusMap[item.status]?.type || 'info'" size="small">
              {{ statusMap[item.status]?.label || item.status }}
            </el-tag>
            <span class="subject-tag">{{ item.subject }}</span>
          </div>
          <h3 class="assignment-title">{{ item.title }}</h3>
          <p class="assignment-desc">{{ item.description }}</p>
          <div class="assignment-meta">
            <div class="meta-item">
              <el-icon><Timer /></el-icon>
              <span :style="{ color: getDeadlineColor(item.deadline, item.status) }">
                {{ getDeadlineText(item.deadline, item.status) }}
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
