<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { questionApi } from '@/api/modules/question'
import type { QuestionItem } from '@/api/modules/question'
import { ElMessage } from 'element-plus'

const categories = ref<string[]>([])
const activeTag = ref('全部')
const questions = ref<QuestionItem[]>([])
const loading = ref(false)

const answerDialogVisible = ref(false)
const currentQuestion = ref<QuestionItem | null>(null)
const selectedAnswer = ref('')
const submitting = ref(false)
const answerResult = ref<{ correct: boolean; message: string; correctAnswer?: string; analysis?: string } | null>(null)

const tags = computed(() => ['全部', ...categories.value])

const filteredQuestions = computed(() => {
  if (activeTag.value === '全部') return questions.value
  return questions.value.filter(q => q.tags?.includes(activeTag.value) || q.type === activeTag.value)
})

const fetchData = async () => {
  loading.value = true
  try {
    const [listRes, catRes] = await Promise.all([
      questionApi.getList({ page: 1, size: 100 }),
      questionApi.getCategories()
    ])
    questions.value = listRes.list || []
    categories.value = catRes || []
  } catch {
    ElMessage.error('加载题目失败，请确保后端服务已启动')
  } finally {
    loading.value = false
  }
}

const parseOptions = (options?: any): string[] => {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try {
      return JSON.parse(options)
    } catch {
      return options.split('\n').filter(o => o.trim())
    }
  }
  return []
}

const openAnswerDialog = (q: QuestionItem) => {
  currentQuestion.value = q
  selectedAnswer.value = ''
  answerResult.value = null
  answerDialogVisible.value = true
}

// 从选项文本中提取字母（如 "B. 后进先出" -> "B"）
const extractAnswerLetter = (text: string): string => {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed.length >= 2 && /^[A-Za-z]/.test(trimmed)) {
    const second = trimmed.charAt(1)
    if (second === '.' || second === ')' || second === '、' || second === ' ' || second === '：' || second === ':') {
      return trimmed.charAt(0).toUpperCase()
    }
  }
  if (trimmed.length === 1 && /^[A-Za-z]$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  return trimmed.toUpperCase()
}

const submitAnswer = async () => {
  if (!selectedAnswer.value || !currentQuestion.value) {
    ElMessage.warning('请选择一个答案')
    return
  }
  submitting.value = true
  try {
    const res = await questionApi.submitAnswer({
      questionId: currentQuestion.value.id,
      userAnswer: selectedAnswer.value
    })
    answerResult.value = res
  } catch (err: any) {
    console.error('答题API调用失败:', err)
    // API失败时本地比较（提取选项字母后比较）
    const q = currentQuestion.value
    const userLetter = extractAnswerLetter(selectedAnswer.value)
    const correctLetter = extractAnswerLetter(q.answer || '')
    const isCorrect = userLetter === correctLetter
    answerResult.value = {
      correct: isCorrect,
      message: isCorrect ? '答案正确！（离线模式）' : '答案错误（离线模式）',
      correctAnswer: q.answer,
      analysis: q.analysis
    }
  } finally {
    submitting.value = false
  }
}

const nextQuestion = () => {
  const idx = filteredQuestions.value.findIndex(q => q.id === currentQuestion.value?.id)
  if (idx >= 0 && idx < filteredQuestions.value.length - 1) {
    openAnswerDialog(filteredQuestions.value[idx + 1])
  } else {
    answerDialogVisible.value = false
  }
}

const diffStars = (d?: number) => {
  if (!d) return 1
  return Math.min(5, Math.ceil(d))
}

onMounted(fetchData)
</script>

<template>
  <div class="dashboard-page">
    <div class="section-header">
      <h2>题库中心</h2>
      <el-input placeholder="搜索题目..." prefix-icon="Search" style="width: 280px;" clearable />
    </div>

    <div class="tag-bar">
      <span
        v-for="tag in tags" :key="tag"
        class="tag-chip" :class="{ active: activeTag === tag }"
        @click="activeTag = tag"
      >{{ tag }}</span>
    </div>

    <div v-loading="loading" class="qset-grid">
      <div v-for="q in filteredQuestions" :key="q.id" class="qset-card" @click="openAnswerDialog(q)">
        <div class="qset-icon">📗</div>
        <div class="qset-info">
          <div class="qset-name">{{ q.content?.slice(0, 60) }}{{ (q.content?.length || 0) > 60 ? '...' : '' }}</div>
          <div class="qset-meta">
            <span>难度: {{ '⭐'.repeat(diffStars(q.difficulty)) }}</span>
            <el-tag size="small" v-if="q.type">{{ q.type }}</el-tag>
            <el-tag size="small" type="info" v-if="q.score">{{ q.score }}分</el-tag>
          </div>
        </div>
        <el-button type="primary" size="small" round @click.stop="openAnswerDialog(q)">开始作答</el-button>
      </div>
      <el-empty v-if="!loading && filteredQuestions.length === 0" description="暂无题目，请确保后端服务已启动" />
    </div>

    <!-- 答题对话框 -->
    <el-dialog
      v-model="answerDialogVisible"
      :title="currentQuestion?.type || '作答'"
      width="650px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="currentQuestion" class="answer-section">
        <div class="question-content">{{ currentQuestion.content }}</div>

        <el-radio-group v-model="selectedAnswer" class="options-group" :disabled="!!answerResult" v-if="parseOptions(currentQuestion.options).length > 0">
          <div
            v-for="(opt, idx) in parseOptions(currentQuestion.options)"
            :key="idx"
            class="option-item"
            :class="{
              'option-selected': selectedAnswer === opt,
              'option-correct': answerResult && opt === currentQuestion.answer,
              'option-wrong': answerResult && selectedAnswer === opt && opt !== currentQuestion.answer
            }"
          >
            <el-radio :label="opt" :value="opt">{{ opt }}</el-radio>
          </div>
        </el-radio-group>

        <el-input
          v-else
          v-model="selectedAnswer"
          placeholder="请输入你的答案..."
          :disabled="!!answerResult"
          type="textarea"
          :rows="3"
        />

        <div v-if="answerResult" class="answer-result" :class="answerResult.correct ? 'result-success' : 'result-error'">
          <p class="result-msg">
            <el-icon><component :is="answerResult.correct ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
            {{ answerResult.message }}
          </p>
          <p v-if="answerResult.correctAnswer" class="result-answer">正确答案: {{ answerResult.correctAnswer }}</p>
          <p v-if="answerResult.analysis" class="result-analysis">{{ answerResult.analysis }}</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="answerDialogVisible = false">关闭</el-button>
          <el-button v-if="!answerResult" type="primary" :loading="submitting" @click="submitAnswer">
            提交答案
          </el-button>
          <el-button v-else type="primary" @click="nextQuestion">
            下一题
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.tag-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: var(--spacing);
}

.tag-chip {
  padding: 6px 16px;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.tag-chip.active {
  background: var(--dashboard-primary);
  color: #fff;
  border-color: var(--dashboard-primary);
}

.tag-chip:hover:not(.active) {
  border-color: var(--dashboard-primary);
  color: var(--dashboard-primary);
}

.qset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing);
}

.qset-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.3s;
}

.qset-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.qset-icon { font-size: 32px; flex-shrink: 0; }

.qset-info { flex: 1; min-width: 0; }

.qset-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.qset-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.question-content {
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  white-space: pre-wrap;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.option-item {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #409EFF;
}

.option-selected {
  border-color: #409EFF;
  background: #ecf5ff;
}

.option-correct {
  border-color: #67C23A !important;
  background: #f0f9eb !important;
}

.option-wrong {
  border-color: #F56C6C !important;
  background: #fef0f0 !important;
}

.answer-result {
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
}

.result-success {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.result-error {
  background: #fef0f0;
  border: 1px solid #fde2e2;
}

.result-msg {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-success .result-msg { color: #67C23A; }
.result-error .result-msg { color: #F56C6C; }

.result-answer {
  font-size: 14px;
  color: #303133;
}

.result-analysis {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
