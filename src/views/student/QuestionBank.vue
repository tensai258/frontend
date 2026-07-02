<script setup lang="ts">
import { ref } from 'vue'
import QuestionSetCard from '@/components/student/QuestionSetCard.vue'

const knowledgeTags = ['全部', '递归', '动态规划', '指针', '链表', '排序', '图论', '贪心']
const activeTag = ref('全部')

const questionSets = [
  { id: 1, name: '递归基础练习', difficulty: 2, totalCount: 50, doneCount: 12, correctRate: 65 },
  { id: 2, name: '动态规划入门', difficulty: 3, totalCount: 30, doneCount: 0, correctRate: 0 },
  { id: 3, name: '指针进阶', difficulty: 4, totalCount: 20, doneCount: 5, correctRate: 40 },
  { id: 4, name: '排序算法', difficulty: 2, totalCount: 40, doneCount: 30, correctRate: 80 },
  { id: 5, name: '链表操作', difficulty: 3, totalCount: 35, doneCount: 8, correctRate: 55 },
  { id: 6, name: '图论基础', difficulty: 4, totalCount: 25, doneCount: 0, correctRate: 0 }
]

const handleStart = (_id: number) => {
  // navigate to practice mode when ready
  void _id
}
</script>

<template>
  <div class="dashboard-page">
    <div class="section-header">
      <h2>题库中心</h2>
      <el-input placeholder="搜索题目..." prefix-icon="Search" style="width: 280px;" clearable />
    </div>

    <div class="tag-bar">
      <span
        v-for="tag in knowledgeTags" :key="tag"
        class="tag-chip" :class="{ active: activeTag === tag }"
        @click="activeTag = tag"
      >{{ tag }}</span>
    </div>

    <div class="qset-grid">
      <QuestionSetCard
        v-for="qs in questionSets" :key="qs.id"
        v-bind="qs" @start="handleStart"
      />
    </div>
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

@media (max-width: 900px) {
  .qset-grid { grid-template-columns: 1fr; }
}
</style>
