<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { questionApi } from '@/api/modules/question'
import type { AiQuestionData } from '@/api/modules/question'

const props = defineProps<{
  visible: boolean
  knowledgeIds?: number[]
  knowledgeName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'complete', results: { total: number; correct: number }): void
}>()

const loading = ref(false)
const questions = ref<AiQuestionData[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref('')
const submitted = ref(false)
const results = ref<Map<number, boolean>>(new Map())
const generatingText = ref('AI正在根据你的薄弱点生成练习题...')

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const progress = computed(() => `${currentIndex.value + 1} / ${questions.value.length}`)
const isLast = computed(() => currentIndex.value >= questions.value.length - 1)
const totalCorrect = computed(() => {
  let c = 0
  results.value.forEach(v => { if (v) c++ })
  return c
})

const answerLetters = ['A', 'B', 'C', 'D', 'E', 'F']

const parseOptionLetter = (opt: string): string => {
  const t = opt.trim()
  if (t.length >= 2 && /^[A-Za-z]/.test(t)) {
    const s = t.charAt(1)
    if (s === '.' || s === ')' || s === '、' || s === ' ' || s === '：' || s === ':') {
      return t.charAt(0).toUpperCase()
    }
  }
  return t.length === 1 && /^[A-Za-z]$/.test(t) ? t.toUpperCase() : ''
}

const fetchQuestions = async () => {
  loading.value = true
  generatingText.value = 'AI正在根据你的薄弱点生成练习题...'
  try {
    const res = await questionApi.aiGenerate({
      knowledgeIds: props.knowledgeIds,
      count: 3,
      courseId: 1
    })
    questions.value = res || []
    if (questions.value.length === 0) {
      generatingText.value = 'AI出题失败，请稍后重试'
    }
  } catch {
    generatingText.value = 'AI服务暂时不可用，请稍后重试'
    questions.value = []
  } finally {
    loading.value = false
  }
}

const submitAnswer = () => {
  if (!selectedAnswer.value || !currentQuestion.value) return
  submitted.value = true
  const letter = parseOptionLetter(selectedAnswer.value)
  const correctLetter = parseOptionLetter(currentQuestion.value.answer)
  const isCorrect = letter === correctLetter
  results.value.set(currentQuestion.value.id, isCorrect)
}

const nextQuestion = () => {
  if (isLast.value) {
    emit('complete', { total: questions.value.length, correct: totalCorrect.value })
    emit('update:visible', false)
    return
  }
  currentIndex.value++
  selectedAnswer.value = ''
  submitted.value = false
}

const close = () => {
  emit('update:visible', false)
}

const restart = () => {
  currentIndex.value = 0
  selectedAnswer.value = ''
  submitted.value = false
  results.value = new Map()
  fetchQuestions()
}

watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = 0
    selectedAnswer.value = ''
    submitted.value = false
    results.value = new Map()
    fetchQuestions()
  }
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    width="680px"
    :close-on-click-modal="false"
    destroy-on-close
    class="ai-practice-dialog"
  >
    <template #header>
      <div class="ai-dialog-header">
        <span class="ai-badge">✨ AI 智能练习</span>
        <span v-if="questions.length" class="ai-progress">{{ progress }}</span>
      </div>
    </template>

    <div v-if="loading" class="ai-loading">
      <el-icon class="ai-spin" :size="40"><Loading /></el-icon>
      <p>{{ generatingText }}</p>
    </div>

    <div v-else-if="questions.length === 0" class="ai-empty">
      <el-empty description="暂无AI生成的题目">
        <el-button type="primary" round @click="restart">重新生成</el-button>
      </el-empty>
    </div>

    <div v-else-if="currentQuestion" class="ai-question-body">
      <div class="ai-question-tag">
        <el-tag size="small" type="warning" effect="dark">✨ AI 生成</el-tag>
        <el-tag v-if="currentQuestion.knowledgeName" size="small" type="info">
          {{ currentQuestion.knowledgeName?.split('(')[0] }}
        </el-tag>
        <span class="ai-diff">
          {{ '⭐'.repeat(Math.min(5, Math.max(1, currentQuestion.difficulty || 3))) }}
        </span>
      </div>

      <div class="ai-question-content">{{ currentQuestion.content }}</div>

      <div class="ai-options">
        <div
          v-for="(opt, idx) in currentQuestion.options"
          :key="idx"
          class="ai-option"
          :class="{
            'selected': selectedAnswer === opt,
            'correct-answer': submitted && parseOptionLetter(opt) === parseOptionLetter(currentQuestion.answer),
            'wrong-answer': submitted && selectedAnswer === opt && parseOptionLetter(opt) !== parseOptionLetter(currentQuestion.answer)
          }"
          @click="!submitted && (selectedAnswer = opt)"
        >
          <span class="option-letter">{{ answerLetters[idx] || idx }}</span>
          <span class="option-text">{{ opt.replace(/^[A-Za-z][.、)\s:：]+\s*/, '') }}</span>
          <el-icon v-if="submitted && parseOptionLetter(opt) === parseOptionLetter(currentQuestion.answer)" class="result-icon correct"><CircleCheckFilled /></el-icon>
          <el-icon v-else-if="submitted && selectedAnswer === opt" class="result-icon wrong"><CircleCloseFilled /></el-icon>
        </div>
      </div>

      <transition name="fade">
        <div v-if="submitted" class="ai-result-panel">
          <div class="result-header" :class="results.get(currentQuestion.id) ? 'result-correct' : 'result-wrong'">
            <el-icon :size="20">
              <component :is="results.get(currentQuestion.id) ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <span>{{ results.get(currentQuestion.id) ? '回答正确！' : '回答错误' }}</span>
          </div>
          <div class="result-analysis">
            <strong>AI 解析：</strong>{{ currentQuestion.analysis }}
          </div>
        </div>
      </transition>
    </div>

    <template #footer>
      <div class="ai-footer">
        <el-button v-if="!submitted && currentQuestion" type="primary" round :disabled="!selectedAnswer" @click="submitAnswer">
          确认答案
        </el-button>
        <el-button v-if="submitted" type="primary" round @click="nextQuestion">
          {{ isLast ? '完成练习' : '下一题 →' }}
        </el-button>
        <el-button round @click="close">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.ai-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ai-badge {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-progress {
  font-size: 13px;
  color: #909399;
}

.ai-loading {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.ai-spin {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-empty {
  padding: 40px 0;
}

.ai-question-body {
  padding: 0 4px;
}

.ai-question-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ai-diff {
  font-size: 12px;
  margin-left: auto;
}

.ai-question-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  white-space: pre-wrap;
}

.ai-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.ai-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e8eaec;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.ai-option:hover:not(.correct-answer):not(.wrong-answer) {
  border-color: #409EFF;
  background: #f0f7ff;
}

.ai-option.selected:not(.correct-answer):not(.wrong-answer) {
  border-color: #409EFF;
  background: #ecf5ff;
}

.ai-option.correct-answer {
  border-color: #67C23A;
  background: #f0f9eb;
}

.ai-option.wrong-answer {
  border-color: #F56C6C;
  background: #fef0f0;
}

.option-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.correct-answer .option-letter {
  background: #67C23A;
  color: #fff;
}

.wrong-answer .option-letter {
  background: #F56C6C;
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.result-icon {
  font-size: 20px;
}

.result-icon.correct { color: #67C23A; }
.result-icon.wrong { color: #F56C6C; }

.ai-result-panel {
  border-radius: 10px;
  overflow: hidden;
  margin-top: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 600;
}

.result-correct {
  background: #f0f9eb;
  color: #67C23A;
}

.result-wrong {
  background: #fef0f0;
  color: #F56C6C;
}

.result-analysis {
  padding: 12px 16px;
  background: #fafafa;
  font-size: 14px;
  line-height: 1.7;
  color: #606266;
  border-top: 1px solid #f0f0f0;
}

.ai-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
