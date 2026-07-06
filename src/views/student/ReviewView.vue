<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reviewApi } from '@/api/modules/review'
import type { ReviewItem } from '@/api/modules/review'
import { ElMessage } from 'element-plus'

const router = useRouter()
const reviews = ref<ReviewItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const currentReview = ref<ReviewItem | null>(null)
const showAnswer = ref(false)
const qualityDialogVisible = ref(false)
const selectedQuality = ref(3)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await reviewApi.getDueReviews()
    reviews.value = res || []
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

const handleReveal = (item: ReviewItem) => {
  currentReview.value = item
  showAnswer.value = true
}

const handleRate = (item: ReviewItem) => {
  currentReview.value = item
  selectedQuality.value = 3
  qualityDialogVisible.value = true
  showAnswer.value = false
}

const confirmQuality = async () => {
  if (!currentReview.value) return
  submitting.value = true
  try {
    await reviewApi.submitReview({
      reviewId: currentReview.value.id,
      quality: selectedQuality.value
    })
    ElMessage.success('复习记录已更新')
    reviews.value = reviews.value.filter(r => r.id !== currentReview.value!.id)
    qualityDialogVisible.value = false
    currentReview.value = null
    showAnswer.value = false
  } catch {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const goQuestionBank = () => router.push('/student/questions')

const parseOptions = (optionsStr?: string): string[] => {
  if (!optionsStr) return []
  try { return JSON.parse(optionsStr) } catch { return [] }
}

const isOptionCorrect = (opt: string, answer?: string) => showAnswer.value && answer && opt.trim().startsWith(answer.charAt(0))
const isOptionUserWrong = (opt: string, answer?: string, userAnswer?: string) =>
  showAnswer.value && userAnswer && opt.trim().startsWith(userAnswer.charAt(0)) && !(answer && opt.trim().startsWith(answer.charAt(0)))

const qualityLabels = ['完全忘记', '看到答案才想起', '答错但感觉熟悉', '答对但很困难', '答对略有犹豫', '完全正确']
const qualityColors = ['#F56C6C', '#E6A23C', '#E6A23C', '#909399', '#67C23A', '#67C23A']

onMounted(fetchData)
</script>

<template>
  <div class="review-page">
    <div class="page-header">
      <h2>复习回顾</h2>
      <p class="page-desc">基于 SM-2 遗忘曲线，在最佳复习时间点提醒你回顾错题</p>
    </div>

    <el-skeleton :loading="loading" animated :count="3">
      <template #default>
        <div v-if="reviews.length === 0" class="empty-state">
          <el-empty description="暂无待复习题目">
            <el-button type="primary" @click="goQuestionBank">去题库练习</el-button>
          </el-empty>
        </div>

        <div v-else class="review-list">
          <div v-for="item in reviews" :key="item.id" class="review-card">
            <div class="card-header">
              <el-tag size="small" type="warning" v-if="item.intervalDays <= 1">今日复习</el-tag>
              <el-tag size="small" type="info" v-else>间隔 {{ item.intervalDays }} 天</el-tag>
              <el-tag size="small">{{ item.knowledgeName || '未知知识点' }}</el-tag>
              <span class="repeat-badge">第 {{ item.repetitions + 1 }} 次复习</span>
            </div>

            <div class="card-body">
              <div class="question-text" v-html="item.content"></div>

              <div v-if="item.options" class="options">
                <div
                  v-for="(opt, idx) in parseOptions(item.options)"
                  :key="idx"
                  class="option-item"
                  :class="{
                    'is-correct': isOptionCorrect(opt, item.answer),
                    'is-user-wrong': isOptionUserWrong(opt, item.answer, item.userAnswer)
                  }"
                >
                  {{ opt }}
                </div>
              </div>

              <div v-if="showAnswer && item.analysis" class="analysis-box">
                <el-alert :title="'解析：' + item.analysis" type="info" :closable="false" show-icon />
              </div>
            </div>

            <div class="card-footer">
              <el-button size="small" @click="handleReveal(item)" v-if="!showAnswer">
                查看答案
              </el-button>
              <el-button size="small" type="primary" @click="handleRate(item)" v-if="showAnswer">
                自我评分
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <el-dialog v-model="qualityDialogVisible" title="自我评分" width="420px" :close-on-click-modal="false">
      <div class="quality-picker">
        <div class="quality-hint">回想刚才的答题情况，为你的掌握程度打分：</div>
        <div class="quality-options">
          <div
            v-for="(label, idx) in qualityLabels"
            :key="idx"
            class="quality-option"
            :class="{ active: selectedQuality === idx }"
            :style="{ borderColor: selectedQuality === idx ? qualityColors[idx] : '' }"
            @click="selectedQuality = idx"
          >
            <span class="quality-score" :style="{ background: qualityColors[idx] }">{{ idx }}</span>
            <span class="quality-label">{{ label }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="qualityDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmQuality">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.review-page {
  max-width: 800px;
  margin: 0 auto;
}
.page-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #303133;
}
.page-desc {
  margin: 0 0 20px;
  color: #909399;
  font-size: 13px;
}
.empty-state {
  margin-top: 60px;
}
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.review-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}
.repeat-badge {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
.card-body {
  padding: 16px;
}
.question-text {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-item {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  font-size: 14px;
  transition: all 0.2s;
}
.option-item.is-correct {
  border-color: #67C23A;
  background: #f0f9eb;
  color: #67C23A;
}
.option-item.is-user-wrong {
  border-color: #F56C6C;
  background: #fef0f0;
  color: #F56C6C;
}
.analysis-box {
  margin-top: 12px;
}
.card-footer {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
.quality-picker {
  padding: 8px 0;
}
.quality-hint {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}
.quality-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quality-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.quality-option:hover {
  border-color: #409EFF;
}
.quality-option.active {
  border-color: #409EFF;
  background: #ecf5ff;
}
.quality-score {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.quality-label {
  font-size: 14px;
  color: #303133;
}
</style>
