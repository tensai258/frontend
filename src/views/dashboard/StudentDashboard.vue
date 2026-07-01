<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import RecommendCard from '@/components/dashboard/RecommendCard.vue'
import KnowledgeRadar from '@/components/dashboard/KnowledgeRadar.vue'
import LearningPath from '@/components/dashboard/LearningPath.vue'
import type { Assignment } from '@/types'

const router = useRouter()

const suggestion = ref('')
const pendingAssignments = ref<Assignment[]>([])

const radarData = [
  { name: '递归', mastery: 45, max: 100 },
  { name: '动态规划', mastery: 38, max: 100 },
  { name: '指针', mastery: 85, max: 100 },
  { name: '数组', mastery: 92, max: 100 },
  { name: '链表', mastery: 78, max: 100 },
  { name: '排序算法', mastery: 65, max: 100 }
]

const recommendedExercises = [
  { name: '递归基础练习', count: 3, estimatedTime: 15 },
  { name: '动态规划入门', count: 2, estimatedTime: 20 }
]

const learningPath = [
  { name: '递归基础', mastery: 45, isCurrent: true },
  { name: '递归与分治', mastery: 0, isCurrent: false },
  { name: '动态规划入门', mastery: 0, isCurrent: false },
  { name: '背包问题', mastery: 0, isCurrent: false }
]

const pathSuggestion = '系统识别你在"递归"和"动态规划"上掌握度较低，已为你生成针对性练习方案。建议完成当前阶段后再进入下一知识点。'

onMounted(async () => {
  suggestion.value = '根据你最近的答题情况，建议今天重点攻克"递归"和"动态规划"这两个薄弱知识点。'
})

const handleStartExercise = () => {
  router.push('/assignments')
}

const handleAskQuestion = (question: string) => {
  router.push({ path: '/chat', query: { message: question } })
}
</script>

<template>
  <div class="dashboard-page">
    <WelcomeBanner :suggestion="suggestion" />

    <div class="dashboard-grid-2">
      <RecommendCard
        title="今日推荐作业"
        :exercises="recommendedExercises"
        :total-time="35"
        reason="基于你近期的答题情况，系统识别出'递归'和'动态规划'两个知识点掌握度较低（掌握度分别为45%和38%），推荐以下针对性练习。"
        @start="handleStartExercise"
      />

      <KnowledgeRadar
        :data="radarData"
        title="我的知识掌握度"
        :weakThreshold="50"
      />
    </div>

    <LearningPath
      :steps="learningPath"
      :suggestion="pathSuggestion"
    />

    <div class="dashboard-grid-2">
      <div class="dashboard-card">
        <div class="card-title">智能答疑</div>
        <el-input
          size="large"
          placeholder="有什么不懂的？问我..."
          clearable
          @keyup.enter="(e: any) => handleAskQuestion(e.target.value)"
        >
          <template #prefix>
            <el-icon><ChatDotRound /></el-icon>
          </template>
        </el-input>
        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          <el-tag
            v-for="q in ['什么是递归？', '动态规划怎么入门？', '指针和引用的区别？']"
            :key="q"
            type="info"
            style="cursor: pointer;"
            @click="handleAskQuestion(q)"
          >
            {{ q }}
          </el-tag>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-title">待完成作业</div>
        <div v-if="pendingAssignments.length === 0" style="text-align: center; padding: 32px 0; color: var(--text-muted);">
          <el-icon :size="40"><Document /></el-icon>
          <p style="margin-top: 12px;">暂无待完成作业</p>
        </div>
        <div v-else class="pending-list">
          <div v-for="asg in pendingAssignments" :key="asg.id" class="pending-item">
            <div class="pending-info">
              <div class="pending-title">{{ asg.title }}</div>
              <div class="pending-deadline">截止：{{ asg.deadline }}</div>
            </div>
            <el-tag :type="asg.status === 'overdue' ? 'danger' : 'warning'" size="small">
              {{ asg.status === 'overdue' ? '已逾期' : '待提交' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F2F3F5;
}

.pending-item:last-child {
  border-bottom: none;
}

.pending-title {
  font-size: 14px;
  color: var(--text-primary);
}

.pending-deadline {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
