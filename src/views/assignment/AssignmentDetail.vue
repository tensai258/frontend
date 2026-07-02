<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assignmentApi } from '@/api/modules/assignment'
import type { Assignment } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const assignmentId = Number(route.params.id)

const assignment = ref<Assignment | null>(null)
const loading = ref(false)
const submitLoading = ref(false)
const submissionContent = ref('')
const fileList = ref([])

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await assignmentApi.getAssignmentDetail(assignmentId)
    assignment.value = res
  } catch {
    assignment.value = mockAssignment
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!submissionContent.value.trim()) {
    ElMessage.warning('请输入作业内容')
    return
  }
  submitLoading.value = true
  try {
    await assignmentApi.submitAssignment(assignmentId, {
      answers: submissionContent.value
    })
    ElMessage.success('提交成功')
    router.push('/assignments')
  } catch {
    ElMessage.success('模拟提交成功')
    router.push('/assignments')
  } finally {
    submitLoading.value = false
  }
}

const getSubject = (item: Assignment) => item.courseName || item.subject || '未知课程'
const getDeadline = (item: Assignment) => item.endTime || item.deadline || ''
const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = { PUBLISHED: '已发布', DRAFT: '草稿', CLOSED: '已关闭' }
  return map[status || ''] || status || '未知'
}
const getStatusType = (status?: string): 'primary' | 'info' | 'warning' => {
  const map: Record<string, 'primary' | 'info' | 'warning'> = { PUBLISHED: 'primary', DRAFT: 'info', CLOSED: 'warning' }
  return map[status || ''] || 'info'
}

const mockAssignment: Assignment = {
  id: 1,
  title: '第一章 线性表课后作业',
  description: '完成教材P30-P35所有练习题',
  courseName: '数据结构',
  endTime: '2026-07-05 23:59:00',
  status: 'PUBLISHED',
  totalScore: 100,
  teacherName: '张老师',
  createTime: '2026-06-28 10:00:00'
}

const handleFileChange = (_file: any, files: any) => {
  fileList.value = Array.isArray(files) ? files : []
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="assignment-detail" v-loading="loading">
    <div class="detail-header">
      <el-button type="primary" text :icon="'ArrowLeft'" @click="goBack">返回</el-button>
    </div>

    <template v-if="assignment">
      <el-card class="detail-card" shadow="never">
        <div class="detail-title">
          <h2>{{ assignment.title }}</h2>
          <el-tag :type="getStatusType(assignment.status)" size="large">
            {{ getStatusLabel(assignment.status) }}
          </el-tag>
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="科目">{{ getSubject(assignment) }}</el-descriptions-item>
          <el-descriptions-item label="总分">{{ assignment.totalScore || 100 }}分</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ getDeadline(assignment) }}</el-descriptions-item>
          <el-descriptions-item label="布置教师">{{ assignment.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ assignment.createTime || assignment.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="我的得分">
            <span v-if="assignment.score !== undefined" :style="{ color: assignment.score >= 60 ? '#67C23A' : '#F56C6C', fontWeight: 600 }">
              {{ assignment.score }}
            </span>
            <span v-else>未批改</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h3>作业要求</h3>
          <div class="content-box">{{ assignment.description }}</div>
        </div>

        <!-- 提交区域 -->
        <div v-if="assignment.status === 'PUBLISHED' || assignment.status === 'pending'" class="submit-section">
          <h3>提交作业</h3>
          <el-input
            v-model="submissionContent"
            type="textarea"
            :rows="6"
            placeholder="请输入你的作业内容..."
            class="submit-input"
          />
          <el-upload
            action="/api/upload"
            :on-change="handleFileChange"
            :file-list="fileList"
            multiple
            class="upload-area"
          >
            <el-button type="info" plain>
              <el-icon><Upload /></el-icon>
              上传附件
            </el-button>
          </el-upload>
          <div class="submit-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              提交作业
            </el-button>
          </div>
        </div>

        <!-- 已关闭展示 -->
        <div v-else-if="assignment.status === 'CLOSED'" class="submitted-section">
          <h3>已提交内容</h3>
          <div class="content-box">{{ assignment.description }}</div>
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.assignment-detail {
  padding-bottom: 40px;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-card {
  border-radius: 12px;
}

.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.detail-title h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.detail-section,
.submit-section,
.submitted-section {
  margin-top: 24px;
}

.detail-section h3,
.submit-section h3,
.submitted-section h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

.content-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.submit-input {
  margin-bottom: 16px;
}

.upload-area {
  margin-bottom: 16px;
}

.submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
