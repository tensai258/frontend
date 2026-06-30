<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assignmentApi } from '@/api/modules/assignment'
import type { Assignment, AssignmentSubmission } from '@/types'
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
    // 后端接口失败时使用模拟数据
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
      content: submissionContent.value,
      attachments: fileList.value.map((f: any) => f.url || f.name)
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

// 模拟数据
const mockAssignment: Assignment = {
  id: 1,
  title: '第一章 线性表课后作业',
  description: '完成教材P30-P35所有练习题，包括：\n1. 简述线性表的两种存储结构及其特点\n2. 编写算法实现顺序表的插入和删除操作\n3. 编写算法实现单链表的逆置\n4. 分析各算法的时间复杂度',
  subject: '数据结构',
  deadline: '2026-07-05 23:59:00',
  status: 'pending',
  totalScore: 100,
  teacherName: '张老师',
  createdAt: '2026-06-28 10:00:00'
}

const handleFileChange = (file: any, files: any[]) => {
  fileList.value = files
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
          <el-tag :type="assignment.status === 'pending' ? 'primary' : 'success'" size="large">
            {{ assignment.status === 'pending' ? '待完成' : '已完成' }}
          </el-tag>
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="科目">{{ assignment.subject }}</el-descriptions-item>
          <el-descriptions-item label="总分">{{ assignment.totalScore || 100 }}分</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ assignment.deadline }}</el-descriptions-item>
          <el-descriptions-item label="布置教师">{{ assignment.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ assignment.createdAt }}</el-descriptions-item>
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
        <div v-if="assignment.status === 'pending'" class="submit-section">
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

        <!-- 已提交展示 -->
        <div v-else-if="assignment.status === 'submitted' || assignment.status === 'graded'" class="submitted-section">
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
