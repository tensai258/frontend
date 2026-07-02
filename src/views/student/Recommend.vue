<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionApi } from '@/api/modules/question'
import type { RecommendData } from '@/api/modules/question'
import { ElMessage } from 'element-plus'
import EmptyWrongState from '@/components/student/EmptyWrongState.vue'

const router = useRouter()
const recommendData = ref<RecommendData | null>(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await questionApi.getRecommend()
    recommendData.value = res
  } catch {
    ElMessage.error('加载推荐失败，请确保已登录且后端服务已启动')
  } finally {
    loading.value = false
  }
}

const hasWrongQuestions = () => {
  const categories = recommendData.value?.weakCategories
  return (categories?.length ?? 0) > 0
}

const totalWrongAll = () => {
  const categories = recommendData.value?.weakCategories
  if (!categories) return 0
  return categories.reduce((sum, c) => sum + (c.wrongCount || 0), 0)
}

const severityLevel = (level: string): number => {
  if (level === '高') return 4
  if (level === '中') return 3
  if (level === '低') return 2
  return 1
}

const severityStars = (level: string) => {
  const n = severityLevel(level)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

const severityColor = (level: string) => {
  if (level === '高') return '#F56C6C'
  if (level === '中') return '#E6A23C'
  return '#409EFF'
}

const goToWrongQuestions = (category: string) => {
  router.push('/student/wrong-qs')
}

const parseOptions = (options?: string): string[] => {
  if (!options) return []
  try {
    const parsed = JSON.parse(options)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return options.split('\n').filter(o => o.trim())
  }
}

// 答题对话框
interface RecQuestion {
  id: number; content: string; options: string; answer: string
  analysis: string; type: string; difficulty: number; category: string
  tags: string; score: number; knowledgeId: number
}
const answerDialogVisible = ref(false)
const currentQuestion = ref<RecQuestion | null>(null)
const selectedAnswer = ref('')
const submitting = ref(false)
const answerResult = ref<{ correct: boolean; message: string; correctAnswer?: string; analysis?: string } | null>(null)

const extractAnswerLetter = (text: string): string => {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed.length >= 2 && /^[A-Za-z]/.test(trimmed)) {
    const second = trimmed.charAt(1)
    if (second === '.' || second === ')' || second === '、' || second === ' ' || second === '：' || second === ':') {
      return trimmed.charAt(0).toUpperCase()
    }
  }
  if (trimmed.length === 1 && /^[A-Za-z]$/.test(trimmed)) return trimmed.toUpperCase()
  return trimmed.toUpperCase()
}

const openAnswerDialog = (q: RecQuestion) => {
  currentQuestion.value = q
  selectedAnswer.value = ''
  answerResult.value = null
  answerDialogVisible.value = true
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
  } catch {
    const q = currentQuestion.value
    const userLetter = extractAnswerLetter(selectedAnswer.value)
    const correctLetter = extractAnswerLetter(q.answer || '')
    answerResult.value = {
      correct: userLetter === correctLetter,
      message: userLetter === correctLetter ? '答案正确！' : '答案错误',
      correctAnswer: q.answer,
      analysis: q.analysis
    }
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="dashboard-page">
    <div class="section-header">
      <h2>个性化推荐</h2>
    </div>

    <div v-if="!hasWrongQuestions() && !loading">
      <EmptyWrongState />
    </div>

    <div v-else v-loading="loading">
      <p class="rec-intro">
        根据你的 <strong>{{ totalWrongAll() }}</strong> 道错题分析，以下知识点需要重点巩固：
      </p>

      <div v-if="recommendData?.suggestion" class="rec-suggestion">
        <el-icon><InfoFilled /></el-icon>
        {{ recommendData.suggestion }}
      </div>

      <div class="rec-list">
        <div v-for="cat in (recommendData?.weakCategories || [])" :key="cat.category" class="rec-item">
          <div class="rec-left">
            <span class="rec-severity" :style="{ color: severityColor(cat.weaknessLevel) }">
              {{ severityStars(cat.weaknessLevel) }}
            </span>
            <div class="rec-info">
              <div class="rec-name">{{ cat.category }}</div>
              <div class="rec-meta">
                错题 {{ cat.wrongCount }} 道 · 已掌握 {{ cat.masteredCount }} 道 · 总计 {{ cat.totalCount }} 道
              </div>
              <div class="rec-level-tag">
                <el-tag :type="cat.weaknessLevel === '高' ? 'danger' : cat.weaknessLevel === '中' ? 'warning' : ''" size="small">
                  薄弱程度: {{ cat.weaknessLevel }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="rec-actions">
            <el-button type="primary" size="small" round @click="router.push('/student/questions')">
              去练习
            </el-button>
            <el-button size="small" round @click="goToWrongQuestions(cat.category)">
              查看错题
            </el-button>
          </div>
        </div>
      </div>

      <!-- 推荐题目 -->
      <div v-if="(recommendData?.recommendedQuestions?.length || 0) > 0" class="rec-questions-section">
        <h3>推荐练习题目</h3>
        <div v-for="q in recommendData!.recommendedQuestions!" :key="q.id" class="rec-question-item" @click="openAnswerDialog(q)">
          <div class="rq-header">
            <el-tag size="small" :type="q.difficulty > 3 ? 'danger' : q.difficulty > 2 ? 'warning' : ''">
              {{ q.type || '题目' }}
            </el-tag>
            <el-tag size="small" type="info">{{ q.category }}</el-tag>
            <span class="rq-score">{{ q.score }}分</span>
          </div>
          <div class="rq-content">{{ q.content?.slice(0, 80) }}{{ (q.content?.length || 0) > 80 ? '...' : '' }}</div>
          <div v-if="parseOptions(q.options).length > 0" class="rq-options">
            <span v-for="(opt, i) in parseOptions(q.options)" :key="i" class="rq-option">{{ opt }}</span>
          </div>
          <el-button type="primary" size="small" round @click.stop="openAnswerDialog(q)">开始作答</el-button>
        </div>
      </div>
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
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.section-header { margin-bottom: 16px; }
.section-header h2 { font-size: 20px; font-weight: 700; margin: 0; color: var(--text-primary); }

.rec-intro { font-size: 14px; color: var(--text-secondary); margin-bottom: var(--spacing); }

.rec-list { display: flex; flex-direction: column; gap: 14px; }

.rec-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  gap: 16px;
}

.rec-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}

.rec-severity {
  font-size: 16px;
  letter-spacing: 2px;
  white-space: nowrap;
}

.rec-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rec-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.rec-tip {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.rec-suggestion {
  padding: 12px 16px;
  background: #f0f5ff;
  border-radius: 8px;
  font-size: 13px;
  color: #409EFF;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.6;
}

.rec-level-tag {
  margin-top: 4px;
}

.rec-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.rec-questions-section {
  margin-top: 24px;
}

.rec-questions-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.rec-question-item {
  padding: 14px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.rq-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rq-score {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.rq-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.7;
  margin-bottom: 10px;
  white-space: pre-wrap;
}

.rq-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.rq-option {
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  border: 1px solid #e4e7ed;
}

/* 答题对话框样式 */
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
