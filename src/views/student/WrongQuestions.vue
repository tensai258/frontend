<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { questionApi } from '@/api/modules/question'
import type { WrongQuestionItem } from '@/api/modules/question'
import { ElMessage } from 'element-plus'

type StatusFilter = 'all' | 'unmastered' | 'mastered'
const statusFilter = ref<StatusFilter>('all')

const wrongList = ref<WrongQuestionItem[]>([])
const loading = ref(false)

const filteredQuestions = computed(() => {
  if (statusFilter.value === 'all') return wrongList.value
  if (statusFilter.value === 'mastered') return wrongList.value.filter(q => q.mastered === 1)
  return wrongList.value.filter(q => q.mastered === 0)
})

const totalWrong = computed(() => wrongList.value.length)
const unmasteredCount = computed(() => wrongList.value.filter(q => q.mastered === 0).length)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await questionApi.getWrongList({ page: 1, size: 100 })
    wrongList.value = res.list || []
  } catch {
    ElMessage.error('加载错题失败，请确保已登录且后端服务已启动')
  } finally {
    loading.value = false
  }
}

const handleMarkMastered = async (id: number) => {
  try {
    await questionApi.markWrongMastered(id)
    const item = wrongList.value.find(q => q.id === id)
    if (item) item.mastered = 1
    ElMessage.success('已标记为掌握')
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await questionApi.deleteWrong(id)
    wrongList.value = wrongList.value.filter(q => q.id !== id)
    ElMessage.success('已删除')
  } catch {
    ElMessage.error('删除失败')
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
      <div>
        <h2>错题集</h2>
        <p class="section-desc">共 {{ totalWrong }} 道错题 · {{ unmasteredCount }} 道未掌握</p>
      </div>
    </div>

    <div class="source-tabs">
      <span
        v-for="opt in [{ k: 'all', l: '全部' }, { k: 'unmastered', l: '未掌握' }, { k: 'mastered', l: '已掌握' }]"
        :key="opt.k"
        class="source-tab" :class="{ active: statusFilter === opt.k }"
        @click="statusFilter = opt.k as StatusFilter"
      >{{ opt.l }}</span>
    </div>

    <div v-loading="loading" class="wq-list">
      <div v-for="wq in filteredQuestions" :key="wq.id" class="wq-card" :style="{ borderLeftColor: wq.mastered === 1 ? '#67C23A' : '#F56C6C' }">
        <div class="wq-header">
          <span class="wq-status-dot" :style="{ background: wq.mastered === 1 ? '#67C23A' : '#F56C6C' }"></span>
          <span class="wq-title">{{ wq.content?.slice(0, 50) || wq.tags || '未知题目' }}{{ (wq.content?.length || 0) > 50 ? '...' : '' }}</span>
          <el-tag v-if="wq.category" size="small">{{ wq.category }}</el-tag>
        </div>
        <div class="wq-meta">
          <span>做错 {{ wq.wrongCount }} 次</span>
          <span v-if="wq.difficulty">难度 {{ '⭐'.repeat(diffStars(wq.difficulty)) }}</span>
        </div>
        <div class="wq-answers" v-if="wq.userAnswer || wq.answer">
          <div class="wq-answer-item wrong">
            <span class="answer-label">你的答案:</span>
            <span class="answer-value">{{ wq.userAnswer || '未记录' }}</span>
          </div>
          <div class="wq-answer-item correct" v-if="wq.answer">
            <span class="answer-label">正确答案:</span>
            <span class="answer-value">{{ wq.answer }}</span>
          </div>
        </div>
        <div class="wq-actions">
          <el-button size="small" type="primary" plain round @click="handleMarkMastered(wq.id)" v-if="wq.mastered === 0">
            标记为掌握
          </el-button>
          <el-button size="small" type="danger" plain round @click="handleDelete(wq.id)">
            删除
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && filteredQuestions.length === 0" description="暂无错题" />
    </div>
  </div>
</template>

<style scoped>
.section-header { margin-bottom: 16px; }
.section-header h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
.section-desc { font-size: 13px; color: var(--text-muted); margin: 0; }

.source-tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing);
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
}

.source-tab {
  padding: 8px 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.source-tab.active {
  background: #fff;
  color: var(--dashboard-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.wq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wq-card {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 20px;
  border-left: 4px solid #ccc;
  transition: all 0.3s;
}

.wq-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.wq-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.wq-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wq-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.wq-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.wq-actions {
  display: flex;
  gap: 8px;
}

.wq-answers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.wq-answer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.wq-answer-item.wrong {
  background: #fef0f0;
  border: 1px solid #fde2e2;
}

.wq-answer-item.correct {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.answer-label {
  color: var(--text-muted);
}

.wq-answer-item.wrong .answer-value {
  color: #F56C6C;
  font-weight: 500;
}

.wq-answer-item.correct .answer-value {
  color: #67C23A;
  font-weight: 500;
}
</style>
