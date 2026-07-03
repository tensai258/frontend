<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assignmentApi } from '@/api/modules/assignment'
import type { Assignment, QuestionBrief } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const assignmentId = Number(route.params.id)

const assignment = ref<Assignment | null>(null)
const loading = ref(false)
const submitLoading = ref(false)
const submitted = ref(false)

// Check localStorage for previous submission
const checkSubmitted = () => {
  try {
    const key = `submitted_${assignmentId}`
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

// Per-question answers: { questionId: answerValue }
const answers = ref<Record<number, string>>({})
const multiAnswers = ref<Record<number, string[]>>({})

// ========== Load ==========
const loadDetail = async () => {
  loading.value = true
  try {
    const res = await assignmentApi.getAssignmentDetail(assignmentId)
    assignment.value = res
    // Init answers
    if (res.questions) {
      res.questions.forEach(q => {
        answers.value[q.id] = ''
        multiAnswers.value[q.id] = []
      })
    }
    // Check if already submitted
    submitted.value = checkSubmitted()
  } catch {
    ElMessage.error('加载作业详情失败')
  } finally {
    loading.value = false
  }
}

// ========== Parse options ==========
const parseOptions = (options?: string): string[] => {
  if (!options) return []
  try { return JSON.parse(options) }
  catch { return options.split('\n').filter(o => o.trim()) }
}

// ========== Check question types ==========
const isChoiceType = (q: QuestionBrief) => q.type === '单选题' || q.type === '判断题'
const isMultipleChoice = (q: QuestionBrief) => q.type === '多选题'
const isFillBlank = (q: QuestionBrief) => q.type === '填空题'

// ========== Multi-answer helpers ==========
const toggleMulti = (qId: number, opt: string) => {
  const arr = [...(multiAnswers.value[qId] || [])]
  const idx = arr.indexOf(opt)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(opt)
  multiAnswers.value[qId] = arr
}

// Extract answer letter from option text (e.g. "B. 后进先出" -> "B")
const extractLetter = (text: string): string => {
  const t = text.trim()
  if (t.length >= 2 && /^[A-Za-z]/.test(t)) {
    const second = t.charAt(1)
    if (second === '.' || second === ')' || second === '、' || second === ' ' || second === '：' || second === ':') {
      return t.charAt(0).toUpperCase()
    }
  }
  if (t.length === 1 && /^[A-Za-z]$/.test(t)) return t.toUpperCase()
  return t.toUpperCase()
}

// ========== Build submission answers JSON ==========
const buildAnswersJson = (): string => {
  const result: Record<string, string> = {}
  if (!assignment.value?.questions) return '{}'

  for (const q of assignment.value.questions) {
    if (isMultipleChoice(q)) {
      const arr = multiAnswers.value[q.id] || []
      result[String(q.id)] = arr.join(',')
    } else {
      result[String(q.id)] = answers.value[q.id] || ''
    }
  }
  return JSON.stringify(result)
}

// ========== Submit ==========
const handleSubmit = async () => {
  // Validate all questions are answered
  if (!assignment.value?.questions) return
  const unanswered: number[] = []
  for (const q of assignment.value.questions) {
    if (isMultipleChoice(q)) {
      if (!multiAnswers.value[q.id] || multiAnswers.value[q.id].length === 0) {
        unanswered.push(q.id)
      }
    } else if (isFillBlank(q)) {
      if (!answers.value[q.id]?.trim()) {
        unanswered.push(q.id)
      }
    } else {
      if (!answers.value[q.id]) {
        unanswered.push(q.id)
      }
    }
  }

  if (unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 道题未作答，请完成所有题目后再提交`)
    return
  }

  try {
    await ElMessageBox.confirm('确定要提交作业吗？提交后无法修改。', '确认提交')
  } catch {
    return
  }

  submitLoading.value = true
  try {
    const answersStr = buildAnswersJson()
    await assignmentApi.submitAssignment(assignmentId, {
      answers: answersStr,
      timeSpent: 0
    })
    ElMessage.success('提交成功！等待教师批改。')

    // Save to localStorage for status tracking
    const key = `submitted_${assignmentId}`
    localStorage.setItem(key, JSON.stringify({
      assignmentId,
      answers: answersStr,
      time: new Date().toISOString(),
      submitted: true
    }))

    submitted.value = true
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg.includes('重复提交') || msg.includes('已截止')) {
      submitted.value = true
    }
    ElMessage.error(msg || '提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// ========== Navigation ==========
const goBack = () => {
  router.back()
}

// ========== Status helpers ==========
const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = { PUBLISHED: '进行中', DRAFT: '草稿', CLOSED: '已截止' }
  return map[status || ''] || status || '未知'
}
const getStatusType = (status?: string): 'primary' | 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, any> = { PUBLISHED: 'primary', DRAFT: 'info', CLOSED: 'warning' }
  return map[status || ''] || 'info'
}

const diffStars = (d?: number) => d ? Math.min(5, Math.ceil(d)) : 1

onMounted(loadDetail)
</script>

<template>
  <div class="assignment-detail" v-loading="loading">
    <div class="detail-header">
      <el-button text :icon="'ArrowLeft'" @click="goBack">返回</el-button>
    </div>

    <template v-if="assignment">
      <!-- 作业信息 -->
      <el-card class="info-card" shadow="never">
        <div class="info-top">
          <h2>{{ assignment.title }}</h2>
          <el-tag :type="getStatusType(assignment.status)" size="large">{{ getStatusLabel(assignment.status) }}</el-tag>
        </div>
        <div class="info-meta">
          <span>课程: {{ assignment.courseName || '数据结构' }}</span>
          <span v-if="assignment.teacherName">教师: {{ assignment.teacherName }}</span>
          <span>总分: {{ assignment.totalScore || 100 }} 分</span>
          <span v-if="assignment.endTime">截止: {{ assignment.endTime }}</span>
          <span>题目数: {{ assignment.questions?.length || 0 }} 题</span>
        </div>
        <p v-if="assignment.description" class="info-desc">{{ assignment.description }}</p>
      </el-card>

      <!-- 已提交状态 -->
      <el-alert
        v-if="submitted"
        title="作业已提交"
        type="success"
        show-icon
        :description="'已成功提交作业，请等待教师批改。'"
        class="submit-alert"
      />

      <!-- 题目列表 -->
      <div class="questions-section">
        <h3 class="section-title">
          题目列表
          <span class="q-count">{{ assignment.questions?.length || 0 }} 题</span>
        </h3>

        <div
          v-for="(q, idx) in assignment.questions"
          :key="q.id"
          class="question-card"
        >
          <div class="q-header">
            <span class="q-number">{{ idx + 1 }}.</span>
            <el-tag size="small" :type="q.type === '判断题' ? 'warning' : q.type === '多选题' ? 'success' : q.type === '填空题' ? 'info' : ''">
              {{ q.type || '题目' }}
            </el-tag>
            <el-tag size="small" type="info" v-if="q.score">{{ q.score }}分</el-tag>
            <span class="q-difficulty">难度 {{ '⭐'.repeat(diffStars(q.difficulty)) }}</span>
          </div>

          <div class="q-content">{{ q.content }}</div>

          <!-- 单选题 / 判断题：Radio -->
          <div v-if="isChoiceType(q)" class="options-group">
            <div
              v-for="(opt, i) in parseOptions(q.options)"
              :key="i"
              class="option-item"
              :class="{ 'opt-selected': answers[q.id] === extractLetter(opt) }"
            >
              <el-radio
                v-model="answers[q.id]"
                :label="extractLetter(opt)"
                :value="extractLetter(opt)"
                :disabled="submitted"
              >
                {{ opt }}
              </el-radio>
            </div>
          </div>

          <!-- 多选题：Checkbox -->
          <div v-else-if="isMultipleChoice(q)" class="options-group">
            <div
              v-for="(opt, i) in parseOptions(q.options)"
              :key="i"
              class="option-item"
              :class="{ 'opt-selected': multiAnswers[q.id]?.includes(opt) }"
            >
              <el-checkbox
                :checked="multiAnswers[q.id]?.includes(opt) || false"
                :disabled="submitted"
                @change="() => toggleMulti(q.id, opt)"
              >
                {{ opt }}
              </el-checkbox>
            </div>
          </div>

          <!-- 填空题：Text Input -->
          <div v-else-if="isFillBlank(q)" class="fill-blank">
            <el-input
              v-model="answers[q.id]"
              :disabled="submitted"
              placeholder="请输入答案..."
              type="textarea"
              :rows="2"
            />
          </div>

          <!-- 其他题型默认用文本输入 -->
          <div v-else class="fill-blank">
            <el-input
              v-model="answers[q.id]"
              :disabled="submitted"
              placeholder="请输入答案..."
              type="textarea"
              :rows="2"
            />
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div v-if="!submitted && assignment.status === 'PUBLISHED'" class="submit-bar">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" size="large" :loading="submitLoading" @click="handleSubmit">
          提交作业
        </el-button>
      </div>

      <div v-if="submitted" class="submit-bar">
        <el-button type="primary" @click="goBack">返回作业列表</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.assignment-detail {
  padding-bottom: 80px;
}
.detail-header { margin-bottom: 16px; }

.info-card {
  border-radius: 12px;
  border: none;
  margin-bottom: 24px;
}
.info-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.info-top h2 { font-size: 20px; font-weight: 700; margin: 0; color: #303133; }
.info-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.info-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0;
}

.submit-alert { margin-bottom: 20px; }

.questions-section {
  margin-bottom: 24px;
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.q-count {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

.question-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.q-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.q-number {
  font-weight: 700;
  font-size: 16px;
  color: #303133;
}
.q-difficulty {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.q-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.8;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-item {
  padding: 10px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}
.option-item:hover { border-color: #409EFF; }
.opt-selected {
  border-color: #409EFF;
  background: #ecf5ff;
}

.fill-blank {
  max-width: 500px;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  z-index: 10;
}
</style>
