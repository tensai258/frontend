<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { assignmentApi } from '@/api/modules/assignment'
import { questionApi } from '@/api/modules/question'
import type { QuestionItem } from '@/api/modules/question'
import type { Assignment } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'

const assignments = ref<Assignment[]>([])
const loading = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const submitDialogVisible = ref(false)
const currentSubmissions = ref<any[]>([])
const submissionsLoading = ref(false)

// Grading dialog
const gradeDialogVisible = ref(false)
const currentGradeSub = ref<any>(null)
const gradeForm = ref({ score: 0, feedback: '' })
const gradingLoading = ref(false)

// ========== Create Assignment Form ==========
const createForm = ref({
  title: '',
  description: '',
  category: '',
  questionType: '',
  questionCount: 5,
  endTime: '',
  totalScore: 100
})

const categories = ref<string[]>([])
const questionTypes = ref<string[]>(['单选题', '多选题', '判断题', '填空题'])
const previewQuestions = ref<QuestionItem[]>([])
const selectedQuestionIds = ref<Set<number>>(new Set())
const previewLoading = ref(false)
const selectAll = ref(false)

// Status display
const statusMap: Record<string, { type: 'primary' | 'success' | 'warning' | 'info'; label: string }> = {
  PUBLISHED: { type: 'primary', label: '已发布' },
  DRAFT: { type: 'info', label: '草稿' },
  CLOSED: { type: 'warning', label: '已关闭' }
}

// ========== Load data ==========
const loadAssignments = async () => {
  loading.value = true
  try {
    const res = await assignmentApi.getMyAssignments({ courseId: 1, page: 1, size: 50 })
    assignments.value = res.list || []
  } catch {
    ElMessage.error('加载作业失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await questionApi.getCategories()
    categories.value = res || []
  } catch {
    categories.value = ['线性表', '栈和队列', '树与二叉树', '排序算法']
  }
}

// ========== Preview questions for selection ==========
const handlePreviewQuestions = async () => {
  previewLoading.value = true
  try {
    const params: any = { page: 1, size: 100 }
    if (createForm.value.category) {
      params.knowledgeId = getKnowledgeIdByName(createForm.value.category)
    }
    const res = await questionApi.getList(params)
    let list = res.list || []

    // Local filter by question type (not supported by backend API)
    if (createForm.value.questionType) {
      list = list.filter(q => q.type === createForm.value.questionType)
    }

    previewQuestions.value = list
    selectedQuestionIds.value = new Set()
    selectAll.value = false
  } catch {
    ElMessage.error('查询题目失败')
  } finally {
    previewLoading.value = false
  }
}

const getKnowledgeIdByName = (name: string): number | undefined => {
  const map: Record<string, number> = {
    '线性表': 1, '顺序表': 9, '链表': 10,
    '栈和队列': 2, '栈': 11, '队列': 12,
    '串': 13, '数组和广义表': 14,
    '树与二叉树': 3, '二叉树': 15, '线索二叉树': 16, '哈夫曼树': 17,
    '图': 18, '图的存储与遍历': 19, '最小生成树': 20, '最短路径': 21, '拓扑排序与关键路径': 22,
    '查找': 23, '哈希查找': 24,
    '排序算法': 4
  }
  return map[name]
}

const toggleQuestion = (id: number) => {
  const s = selectedQuestionIds.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
}

const handleSelectAll = () => {
  selectAll.value = !selectAll.value
  if (selectAll.value) {
    selectedQuestionIds.value = new Set(previewQuestions.value.map(q => q.id))
  } else {
    selectedQuestionIds.value = new Set()
  }
}

// ========== Create Assignment ==========
const handleCreateAssignment = async () => {
  if (!createForm.value.title.trim()) {
    ElMessage.warning('请输入作业标题')
    return
  }
  if (selectedQuestionIds.value.size === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }

  submitting.value = true
  try {
    await assignmentApi.createAssignment({
      title: createForm.value.title,
      description: createForm.value.description,
      courseId: 1,
      questionIds: Array.from(selectedQuestionIds.value).join(','),
      totalScore: createForm.value.totalScore || undefined,
      endTime: createForm.value.endTime || undefined
    })
    ElMessage.success('作业发布成功')
    createDialogVisible.value = false
    createForm.value = { title: '', description: '', category: '', questionType: '', questionCount: 5, endTime: '', totalScore: 100 }
    previewQuestions.value = []
    selectedQuestionIds.value = new Set()
    loadAssignments()
  } catch (e: any) {
    ElMessage.error(e?.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

// ========== Actions ==========
const handleClose = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要关闭该作业吗？学生将无法再提交。', '确认关闭')
    await assignmentApi.closeAssignment(id)
    ElMessage.success('已关闭')
    loadAssignments()
  } catch {
    // cancelled
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该作业吗？此操作不可撤销。', '确认删除', { type: 'warning' })
    await assignmentApi.deleteAssignment(id)
    ElMessage.success('已删除')
    loadAssignments()
  } catch {
    // cancelled
  }
}

const viewSubmissions = async (id: number) => {
  submissionsLoading.value = true
  submitDialogVisible.value = true
  try {
    const res = await assignmentApi.getSubmissions(id)
    currentSubmissions.value = res || []
  } catch {
    ElMessage.error('加载提交记录失败')
    currentSubmissions.value = []
  } finally {
    submissionsLoading.value = false
  }
}

const openGradeDialog = (sub: any) => {
  currentGradeSub.value = sub
  gradeForm.value = { score: sub.score || 0, feedback: sub.feedback || '' }
  gradeDialogVisible.value = true
}

const handleGrade = async () => {
  if (!currentGradeSub.value) return
  gradingLoading.value = true
  try {
    await assignmentApi.gradeAssignment(
      currentGradeSub.value.assignmentId,
      currentGradeSub.value.id,
      gradeForm.value
    )
    ElMessage.success('评分成功')
    gradeDialogVisible.value = false
    // Refresh submissions
    if (currentSubmissions.value.length > 0) {
      const id = currentSubmissions.value[0].assignmentId
      const res = await assignmentApi.getSubmissions(id)
      currentSubmissions.value = res || []
    }
  } catch {
    ElMessage.error('评分失败')
  } finally {
    gradingLoading.value = false
  }
}

const getType = (item: Assignment) => item.courseName || item.subject || '数据结构'
const getDeadline = (item: Assignment) => item.endTime || item.deadline || ''

const openCreateDialog = () => {
  createForm.value = { title: '', description: '', category: '', questionType: '', questionCount: 5, endTime: '', totalScore: 100 }
  previewQuestions.value = []
  selectedQuestionIds.value = new Set()
  createDialogVisible.value = true
}

onMounted(() => {
  loadAssignments()
  loadCategories()
})
</script>

<template>
  <div class="teacher-assignments">
    <PageHeader title="作业管理" description="发布和管理数据结构课程的作业" />

    <!-- 操作栏 -->
    <el-card class="action-card" shadow="never">
      <div class="action-bar">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>发布新作业
        </el-button>
        <el-button @click="loadAssignments" :loading="loading">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <span class="total-count">共 {{ assignments.length }} 个作业</span>
      </div>
    </el-card>

    <!-- 作业列表 -->
    <div v-loading="loading" class="assignment-list">
      <el-card v-for="item in assignments" :key="item.id" class="assignment-card" shadow="hover">
        <div class="card-body">
          <div class="card-info">
            <div class="card-top">
              <h3 class="card-title">{{ item.title }}</h3>
              <el-tag :type="statusMap[item.status || '']?.type || 'info'" size="small">
                {{ statusMap[item.status || '']?.label || item.status }}
              </el-tag>
            </div>
            <p class="card-desc">{{ item.description || '暂无描述' }}</p>
            <div class="card-meta">
              <span><el-icon><Notebook /></el-icon>{{ getType(item) }}</span>
              <span v-if="getDeadline(item)">
                <el-icon><Timer /></el-icon>截止: {{ getDeadline(item) }}
              </span>
              <span><el-icon><User /></el-icon>{{ item.submissionCount || 0 }} 人提交</span>
              <span><el-icon><Trophy /></el-icon>{{ item.totalScore || 100 }} 分</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button size="small" round @click="viewSubmissions(item.id)">
              查看提交 ({{ item.submissionCount || 0 }})
            </el-button>
            <el-button
              v-if="item.status === 'PUBLISHED'"
              size="small" round type="warning"
              @click="handleClose(item.id)"
            >关闭</el-button>
            <el-button
              size="small" round type="danger"
              @click="handleDelete(item.id)"
            >删除</el-button>
          </div>
        </div>
      </el-card>

      <el-empty v-if="assignments.length === 0 && !loading" description="还没有发布过作业，点击上方按钮发布" />
    </div>

    <!-- 发布作业对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="发布新作业"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="作业标题" required>
          <el-input v-model="createForm.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="可选：描述作业要求" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-input v-model="createForm.endTime" placeholder="例如: 2026-07-10 23:59:00" />
        </el-form-item>
        <el-form-item label="总分">
          <el-input-number v-model="createForm.totalScore" :min="1" :max="500" />
        </el-form-item>

        <el-divider>选择题目</el-divider>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="题目类型">
              <el-select v-model="createForm.category" placeholder="全部类型" clearable style="width:100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="题目种类">
              <el-select v-model="createForm.questionType" placeholder="全部种类" clearable style="width:100%">
                <el-option v-for="t in questionTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handlePreviewQuestions" :loading="previewLoading">
            查询题目
          </el-button>
          <span class="hint">选择题目类型和种类后点击查询，然后勾选需要的题目</span>
        </el-form-item>

        <!-- 题目预览 -->
        <div v-if="previewQuestions.length > 0" class="question-preview">
          <div class="preview-header">
            <span class="preview-count">共查到 {{ previewQuestions.length }} 道题</span>
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
            <span class="selected-count">已选 {{ selectedQuestionIds.size }} 题</span>
          </div>
          <div class="preview-list">
            <div
              v-for="q in previewQuestions" :key="q.id"
              class="preview-item"
              :class="{ selected: selectedQuestionIds.has(q.id) }"
              @click="toggleQuestion(q.id)"
            >
              <el-checkbox :checked="selectedQuestionIds.has(q.id)" @click.stop="toggleQuestion(q.id)" />
              <div class="item-content">
                <div class="item-text">{{ q.content?.slice(0, 60) }}{{ (q.content?.length || 0) > 60 ? '...' : '' }}</div>
                <div class="item-tags">
                  <el-tag size="small">{{ q.type }}</el-tag>
                  <el-tag size="small" type="info">{{ q.tags }}</el-tag>
                  <el-tag size="small" type="warning">{{ q.score || 5 }}分</el-tag>
                  <el-tag size="small" :type="(q.difficulty || 0) > 2.5 ? 'danger' : 'success'">
                    难度{{ q.difficulty }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreateAssignment" :disabled="selectedQuestionIds.size === 0">
          发布作业 ({{ selectedQuestionIds.size }} 题)
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看提交对话框 -->
    <el-dialog
      v-model="submitDialogVisible"
      title="学生提交记录"
      width="700px"
    >
      <div v-loading="submissionsLoading">
        <div v-for="sub in currentSubmissions" :key="sub.id" class="submission-item">
          <div class="sub-header">
            <el-avatar size="small">{{ sub.studentName?.charAt(0) || '?' }}</el-avatar>
            <span class="sub-name">{{ sub.studentName || '学生#' + sub.studentId }}</span>
            <el-tag v-if="sub.status === 1" type="success" size="small">已批改</el-tag>
            <el-tag v-else type="info" size="small">待批改</el-tag>
            <span class="sub-time">{{ sub.submitTime || sub.createTime || '' }}</span>
          </div>
          <div class="sub-answers">
            <span class="sub-label">答卷: </span>
            <span class="sub-text">{{ sub.answers?.slice(0, 100) || '无内容' }}</span>
          </div>
          <div class="sub-footer">
            <span v-if="sub.score !== null && sub.score !== undefined">
              得分: <strong :style="{ color: sub.score >= 60 ? '#67C23A' : '#F56C6C' }">{{ sub.score }}</strong> 分
            </span>
            <span v-else class="ungraded">未评分</span>
            <el-button size="small" type="primary" plain @click="openGradeDialog(sub)">评分</el-button>
          </div>
        </div>
        <el-empty v-if="(!currentSubmissions || currentSubmissions.length === 0) && !submissionsLoading" description="暂无学生提交" />
      </div>
    </el-dialog>

    <!-- 评分对话框 -->
    <el-dialog
      v-model="gradeDialogVisible"
      title="批改评分"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form :model="gradeForm" label-width="80px">
        <el-form-item label="得分" required>
          <el-input-number v-model="gradeForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="gradeForm.feedback" type="textarea" :rows="3" placeholder="可选：输入评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="gradingLoading" @click="handleGrade">提交评分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.teacher-assignments {
  padding-bottom: 40px;
}

.action-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assignment-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 10px;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.question-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-count {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
}

.selected-count {
  margin-left: auto;
  font-size: 13px;
  color: #409EFF;
  font-weight: 600;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-item:hover {
  border-color: #409EFF;
  background: #f5f7fa;
}

.preview-item.selected {
  border-color: #409EFF;
  background: #ecf5ff;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hint {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
}

/* Submissions */
.submission-item {
  padding: 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
}

.sub-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.sub-name {
  font-weight: 600;
  color: #303133;
}

.sub-time {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.sub-answers {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.sub-label {
  color: #909399;
}

.sub-text {
  color: #303133;
}

.sub-footer {
  font-size: 13px;
}

.ungraded {
  color: #909399;
}
</style>
