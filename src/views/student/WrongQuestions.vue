<script setup lang="ts">
import { ref, computed } from 'vue'
import WrongQuestionCard from '@/components/student/WrongQuestionCard.vue'

type SourceFilter = 'all' | 'question_bank' | 'assignment'
const sourceFilter = ref<SourceFilter>('all')

const wrongQuestions = [
  { id: 1, title: '二叉树的中序遍历', source: 'question_bank' as const, sourceName: '题库中心', knowledge: '递归', wrongCount: 2, difficulty: 3, lastError: '忘记了递归终止条件', status: 'unfixed' as const },
  { id: 2, title: '动态规划-背包问题', source: 'assignment' as const, sourceName: '数据结构第三章作业', knowledge: '动态规划', wrongCount: 1, difficulty: 4, status: 'unfixed' as const },
  { id: 3, title: '链表反转', source: 'question_bank' as const, sourceName: '题库中心', knowledge: '链表', wrongCount: 1, difficulty: 2, lastError: '指针指向错误', status: 'reviewing' as const },
  { id: 4, title: '快速排序实现', source: 'assignment' as const, sourceName: '算法设计作业', knowledge: '排序', wrongCount: 3, difficulty: 3, lastError: '分区逻辑错误', status: 'unfixed' as const },
  { id: 5, title: '图的DFS遍历', source: 'question_bank' as const, sourceName: '题库中心', knowledge: '图论', wrongCount: 1, difficulty: 4, status: 'mastered' as const }
]

const filteredQuestions = computed(() => {
  if (sourceFilter.value === 'all') return wrongQuestions
  return wrongQuestions.filter(q => q.source === sourceFilter.value)
})

const totalWrong = wrongQuestions.length
const knowledgeCount = computed(() => new Set(wrongQuestions.map(q => q.knowledge)).size)

const handleRetry = (_id: number) => {
  // navigate to practice mode when ready
}
</script>

<template>
  <div class="dashboard-page">
    <div class="section-header">
      <div>
        <h2>错题集</h2>
        <p class="section-desc">共 {{ totalWrong }} 道错题 · 覆盖 {{ knowledgeCount }} 个知识点</p>
      </div>
    </div>

    <div class="source-tabs">
      <span
        v-for="opt in [{ k: 'all', l: '全部错题' }, { k: 'question_bank', l: '来自题库' }, { k: 'assignment', l: '来自作业' }]"
        :key="opt.k"
        class="source-tab" :class="{ active: sourceFilter === opt.k }"
        @click="sourceFilter = opt.k as SourceFilter"
      >{{ opt.l }}</span>
    </div>

    <div class="wq-list">
      <WrongQuestionCard
        v-for="wq in filteredQuestions" :key="wq.id"
        v-bind="wq" @retry="handleRetry"
      />
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
</style>
