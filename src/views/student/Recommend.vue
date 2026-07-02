<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyWrongState from '@/components/student/EmptyWrongState.vue'

const router = useRouter()
const hasWrongQuestions = ref(true)

const weakPoints = [
  { knowledge: '递归算法', severity: 4, questionCount: 10, suggestion: '建议: 从基础遍历题开始，逐步提升' },
  { knowledge: '动态规划', severity: 3, questionCount: 7, suggestion: '建议: 重点练习状态转移方程设计' },
  { knowledge: '链表操作', severity: 2, questionCount: 6, suggestion: '建议: 加强指针操作练习' }
]

const totalWrong = 23

const severityStars = (level: number) => '★'.repeat(level) + '☆'.repeat(5 - level)
const severityColor = (level: number) => {
  if (level >= 4) return '#F56C6C'
  if (level >= 3) return '#E6A23C'
  return '#409EFF'
}
</script>

<template>
  <div class="dashboard-page">
    <div class="section-header">
      <h2>个性化推荐</h2>
    </div>

    <div v-if="!hasWrongQuestions">
      <EmptyWrongState />
    </div>

    <div v-else>
      <p class="rec-intro">
        根据你的 <strong>{{ totalWrong }}</strong> 道错题分析，以下知识点需要重点巩固：
      </p>

      <div class="rec-list">
        <div v-for="wp in weakPoints" :key="wp.knowledge" class="rec-item">
          <div class="rec-left">
            <span class="rec-severity" :style="{ color: severityColor(wp.severity) }">
              {{ severityStars(wp.severity) }}
            </span>
            <div class="rec-info">
              <div class="rec-name">{{ wp.knowledge }}</div>
              <div class="rec-meta">关联 {{ wp.questionCount }} 道错题</div>
              <div class="rec-tip">{{ wp.suggestion }}</div>
            </div>
          </div>
          <el-button type="primary" size="small" round @click="router.push('/student/questions')">
            去练习
          </el-button>
        </div>
      </div>
    </div>
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
</style>
