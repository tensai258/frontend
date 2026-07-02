# Student Six-Module Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the student experience into a six-tab module system (QuestionBank, Assignments, WrongQuestions, Recommendations, Analysis, Chat) with a shared Tab container layout.

**Architecture:** StudentLayout.vue serves as the top-level container with an Element Plus `<el-tabs>` bar. Each tab is a child route rendered via `<router-view>` inside the active tab panel. Existing pages (AssignmentView, StudentAnalysis, ChatView) get visual redesigns. New pages (QuestionBank, WrongQuestions, Recommend) are built from scratch. The old StudentDashboard is removed.

**Tech Stack:** Vue 3 + TypeScript + Element Plus + ECharts (report-style only) + vue-echarts

---

### Task 1: StudentLayout — Tab Container

**Files:**
- Create: `src/views/student/StudentLayout.vue`
- Create: `src/views/student/QuestionBank.vue` (placeholder, filled in Task 2)
- Create: `src/views/student/WrongQuestions.vue` (placeholder, filled in Task 3)
- Create: `src/views/student/Recommend.vue` (placeholder, filled in Task 4)

- [ ] **Step 1: Create StudentLayout.vue**

Write `src/views/student/StudentLayout.vue`:

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/student/questions', label: '题库中心', icon: 'Collection' },
  { path: '/student/assignments', label: '作业中心', icon: 'Document' },
  { path: '/student/wrong-qs', label: '错题集', icon: 'WarningFilled' },
  { path: '/student/recommend', label: '个性化推荐', icon: 'MagicStick' },
  { path: '/student/analysis', label: '学情分析', icon: 'DataAnalysis' },
  { path: '/student/chat', label: '智能答疑', icon: 'ChatDotRound' }
]

const activeTab = ref(route.path)

watch(() => route.path, (val) => {
  const matched = tabs.find(t => val.startsWith(t.path))
  if (matched) activeTab.value = matched.path
})

const handleTabClick = (tab: any) => {
  router.push(tab.props.name)
}
</script>

<template>
  <div class="student-layout">
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: activeTab === tab.path }"
        @click="handleTabClick({ props: { name: tab.path } })"
      >
        <el-icon :size="16"><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
      </div>
    </div>
    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.student-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: var(--dashboard-primary);
}

.tab-item.active {
  color: var(--dashboard-primary);
  border-bottom-color: var(--dashboard-primary);
  font-weight: 600;
}

.tab-content {
  flex: 1;
  padding: var(--spacing);
  overflow-y: auto;
}
</style>
```

- [ ] **Step 2: Create placeholder pages for new modules**

Write `src/views/student/QuestionBank.vue`:

```vue
<template>
  <div class="dashboard-page">
    <h2>题库中心</h2>
    <p>即将上线</p>
  </div>
</template>
```

Create identical placeholders for `WrongQuestions.vue` and `Recommend.vue` (same structure, different h2 text: "错题集", "个性化推荐").

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/student/StudentLayout.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/student/
git commit -m "feat: add StudentLayout tab container and module placeholders"
```

---

### Task 2: QuestionBank Page

**Files:**
- Overwrite: `src/views/student/QuestionBank.vue`
- Create: `src/components/student/QuestionSetCard.vue`

- [ ] **Step 1: Create QuestionSetCard.vue**

Write `src/components/student/QuestionSetCard.vue`:

```vue
<script setup lang="ts">
interface Props {
  id: number
  name: string
  difficulty: number
  totalCount: number
  doneCount: number
  correctRate: number
}

defineProps<Props>()
const emit = defineEmits<{ start: [id: number] }>()

const diffStars = (level: number) => '⭐'.repeat(level)
</script>

<template>
  <div class="qset-card" @click="emit('start', id)">
    <div class="qset-icon">📗</div>
    <div class="qset-info">
      <div class="qset-name">{{ name }}</div>
      <div class="qset-meta">
        <span>难度: {{ diffStars(difficulty) }}</span>
        <span>{{ totalCount }}题</span>
      </div>
      <div class="qset-progress" v-if="doneCount > 0">
        <span>已做: {{ doneCount }} | 正确率{{ correctRate }}%</span>
        <el-progress :percentage="correctRate" :stroke-width="6" :show-text="false" />
      </div>
    </div>
    <el-button type="primary" size="small" round>
      {{ doneCount > 0 ? '继续练习' : '开始练习' }}
    </el-button>
  </div>
</template>

<style scoped>
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
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.qset-progress {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
```

- [ ] **Step 2: Replace QuestionBank placeholder with full page**

Overwrite `src/views/student/QuestionBank.vue`:

```vue
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

const handleStart = (id: number) => {
  // TODO: navigate to practice mode
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
```

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/student/QuestionBank.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/student/QuestionBank.vue src/components/student/QuestionSetCard.vue
git commit -m "feat: add QuestionBank page with knowledge tags and question set cards"
```

---

### Task 3: WrongQuestions Page

**Files:**
- Overwrite: `src/views/student/WrongQuestions.vue`
- Create: `src/components/student/WrongQuestionCard.vue`

- [ ] **Step 1: Create WrongQuestionCard.vue**

Write `src/components/student/WrongQuestionCard.vue`:

```vue
<script setup lang="ts">
interface Props {
  id: number
  title: string
  source: 'question_bank' | 'assignment'
  sourceName: string
  knowledge: string
  wrongCount: number
  difficulty: number
  lastError?: string
  status: 'unfixed' | 'reviewing' | 'mastered'
}

defineProps<Props>()
const emit = defineEmits<{ retry: [id: number] }>()

const statusColors: Record<string, string> = {
  unfixed: '#F56C6C',
  reviewing: '#E6A23C',
  mastered: '#67C23A'
}

const diffStars = (level: number) => '⭐'.repeat(level)
</script>

<template>
  <div class="wq-card" :style="{ borderLeftColor: statusColors[status] }">
    <div class="wq-header">
      <span class="wq-status-dot" :style="{ background: statusColors[status] }"></span>
      <span class="wq-title">{{ title }}</span>
      <el-tag size="small" :type="source === 'assignment' ? 'warning' : ''">
        {{ source === 'assignment' ? '来自作业' : '来自题库' }}
      </el-tag>
    </div>
    <div class="wq-meta">
      <span>知识点: {{ knowledge }}</span>
      <span>做错 {{ wrongCount }} 次</span>
      <span>难度 {{ diffStars(difficulty) }}</span>
    </div>
    <div v-if="lastError" class="wq-reason">上次错误原因: "{{ lastError }}"</div>
    <el-button size="small" type="primary" plain round @click="emit('retry', id)">
      {{ status === 'mastered' ? '再次练习' : '重新作答' }}
    </el-button>
  </div>
</template>

<style scoped>
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
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.wq-reason {
  font-size: 12px;
  color: var(--text-secondary);
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}
</style>
```

- [ ] **Step 2: Replace WrongQuestions placeholder with full page**

Overwrite `src/views/student/WrongQuestions.vue`:

```vue
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

const handleRetry = (id: number) => {
  // TODO: navigate to practice mode for this question
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
```

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/student/WrongQuestions.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/student/WrongQuestions.vue src/components/student/WrongQuestionCard.vue
git commit -m "feat: add WrongQuestions page with source filtering and status tracking"
```

---

### Task 4: Recommend Page

**Files:**
- Overwrite: `src/views/student/Recommend.vue`
- Create: `src/components/student/EmptyWrongState.vue`

- [ ] **Step 1: Create EmptyWrongState.vue**

Write `src/components/student/EmptyWrongState.vue`:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="empty-state">
    <el-icon :size="64" color="#C0C4CC"><FolderOpened /></el-icon>
    <h3>当前没有错题</h3>
    <p>请先去题库中心或完成作业再来</p>
    <div class="empty-actions">
      <el-button type="primary" @click="router.push('/student/questions')">去题库中心</el-button>
      <el-button @click="router.push('/student/assignments')">去作业中心</el-button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 80px 0;
}
.empty-state h3 { font-size: 18px; color: var(--text-primary); margin: 16px 0 8px; }
.empty-state p { color: var(--text-muted); margin-bottom: 24px; }
.empty-actions { display: flex; gap: 12px; justify-content: center; }
</style>
```

- [ ] **Step 2: Replace Recommend placeholder with full page**

Overwrite `src/views/student/Recommend.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import EmptyWrongState from '@/components/student/EmptyWrongState.vue'

const router = useRouter()

// Simulated: would come from API based on wrong questions
const hasWrongQuestions = ref(true)

const weakPoints = [
  { knowledge: '递归算法', severity: 4, questionCount: 10, suggestion: '建议: 从基础遍历题开始，逐步提升' },
  { knowledge: '动态规划', severity: 3, questionCount: 7, suggestion: '建议: 重点练习状态转移方程设计' },
  { knowledge: '链表操作', severity: 2, questionCount: 6, suggestion: '建议: 加强指针操作练习' }
]

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
        根据你的 <strong>{{ 23 }}</strong> 道错题分析，以下知识点需要重点巩固：
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
```

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/student/Recommend.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/student/Recommend.vue src/components/student/EmptyWrongState.vue
git commit -m "feat: add Recommend page with severity-based weak point analysis and empty state"
```

---

### Task 5: Redesign StudentAnalysis — Report Style

**Files:**
- Modify: `src/views/analysis/StudentAnalysis.vue`
- Create: `src/components/student/ReportSection.vue`

- [ ] **Step 1: Create ReportSection.vue**

Write `src/components/student/ReportSection.vue`:

```vue
<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="report-section">
    <h3 class="report-title">{{ title }}</h3>
    <div class="report-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.report-section {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 24px;
  margin-bottom: var(--spacing);
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.report-body {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}
</style>
```

- [ ] **Step 2: Rewrite StudentAnalysis.vue**

Replace the entire content of `src/views/analysis/StudentAnalysis.vue` with report-style layout:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '@/components/student/ReportSection.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, TitleComponent, CanvasRenderer])

interface KnowledgeItem {
  name: string
  level: number
  label: string
  rate: number
}

const overview = {
  totalQuestions: 156,
  totalKnowledge: 12,
  correctRate: 76,
  grade: 'B+',
  studyDays: 42,
  dailyAvg: 3.7,
  totalHours: 12.5,
  avgPerQuestion: 4.8,
  peakTime: '晚上 20:00 - 22:00'
}

const knowledgeList: KnowledgeItem[] = [
  { name: '数组与链表', level: 5, label: '优秀', rate: 92 },
  { name: '排序算法', level: 4, label: '良好', rate: 80 },
  { name: '指针操作', level: 4, label: '良好', rate: 78 },
  { name: '图论基础', level: 3, label: '一般', rate: 65 },
  { name: '动态规划', level: 2, label: '薄弱', rate: 38 },
  { name: '递归算法', level: 1, label: '需加强', rate: 45 }
]

const levelStars = (l: number) => '⭐'.repeat(l)

const weeks = ['第1周', '第2周', '第3周', '第4周']
const weeklyRates = [68, 72, 74, 76]

const trendOption = computed(() => ({
  grid: { left: 30, right: 20, top: 10, bottom: 20 },
  xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 12 } },
  yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 12 } },
  series: [{
    data: weeklyRates,
    type: 'line',
    lineStyle: { color: '#409EFF', width: 2 },
    itemStyle: { color: '#409EFF' },
    areaStyle: { color: 'rgba(64,158,255,0.08)' }
  }]
}))
</script>

<template>
  <div class="analysis-report">
    <div class="report-header">
      <h2>学习报告</h2>
      <span class="report-period">2026年7月 · 第1周</span>
    </div>

    <ReportSection title="总体表现">
      <p>本学期完成 <strong>{{ overview.totalQuestions }}</strong> 道题目，覆盖 <strong>{{ overview.totalKnowledge }}</strong> 个知识点。</p>
      <div class="grade-row">
        <div class="grade-badge">{{ overview.grade }}</div>
        <div class="grade-meta">
          <div>正确率：<strong>{{ overview.correctRate }}%</strong></div>
          <div>答题总数：<strong>{{ overview.totalQuestions }}</strong></div>
          <div>学习天数：<strong>{{ overview.studyDays }} 天</strong></div>
          <div>日均答题：<strong>{{ overview.dailyAvg }} 题</strong></div>
        </div>
      </div>
    </ReportSection>

    <ReportSection title="知识点掌握情况">
      <div class="knowledge-list">
        <div v-for="k in knowledgeList" :key="k.name" class="knowledge-row">
          <span class="k-stars">{{ levelStars(k.level) }}</span>
          <span class="k-name">{{ k.name }}</span>
          <span class="k-label" :class="{ weak: k.level <= 2 }">{{ k.label }}</span>
        </div>
      </div>
      <div class="k-tip">
        ⚠ 建议重点复习：<strong>动态规划、递归算法</strong>
      </div>
    </ReportSection>

    <ReportSection title="近期趋势">
      <div class="trend-text">
        近4周正确率变化：
        <span v-for="(r, i) in weeklyRates" :key="i" class="week-chip">
          第{{ i + 1 }}周: <strong>{{ r }}%</strong>{{ i < weeklyRates.length - 1 ? ' →' : '' }}
        </span>
      </div>
      <VChart :option="trendOption" style="height: 160px; margin-top: 12px;" autoresize />
      <p class="trend-conclusion">趋势：📈 稳步上升</p>
    </ReportSection>

    <ReportSection title="用时分析">
      <p>总学习时长：<strong>{{ overview.totalHours }} 小时</strong></p>
      <p>平均每题耗时：<strong>{{ overview.avgPerQuestion }} 分钟</strong></p>
      <p>最常学习时段：<strong>{{ overview.peakTime }}</strong></p>
    </ReportSection>
  </div>
</template>

<style scoped>
.analysis-report { max-width: 800px; }

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--spacing);
}

.report-header h2 { font-size: 22px; font-weight: 700; margin: 0; color: var(--text-primary); }

.report-period { font-size: 13px; color: var(--text-muted); }

.grade-row { display: flex; gap: 24px; align-items: center; margin-top: 12px; }

.grade-badge {
  width: 80px; height: 80px;
  background: #f0f5ff; color: #409EFF;
  font-size: 36px; font-weight: 800; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.grade-meta { display: flex; flex-direction: column; gap: 4px; }

.knowledge-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 0; border-bottom: 1px solid #f5f5f5;
}
.knowledge-row:last-child { border-bottom: none; }

.k-stars { font-size: 16px; letter-spacing: 2px; width: 130px; }

.k-name { flex: 1; font-weight: 500; }

.k-label { font-size: 13px; }

.k-label.weak { color: #F56C6C; font-weight: 600; }

.k-tip {
  margin-top: 12px; padding: 10px 14px;
  background: #fef0f0; border-radius: 8px;
  font-size: 13px; color: #F56C6C;
}

.trend-text { font-size: 14px; }

.week-chip { margin-right: 8px; }

.trend-conclusion { font-size: 14px; color: #67C23A; margin-top: 8px; }
</style>
```

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/analysis/StudentAnalysis.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/analysis/StudentAnalysis.vue src/components/student/ReportSection.vue
git commit -m "feat: redesign StudentAnalysis as report-style with star ratings and simple trend line"
```

---

### Task 6: Redesign ChatView — ChatGPT Style

**Files:**
- Modify: `src/views/chat/ChatView.vue`

- [ ] **Step 1: Update ChatView styles for ChatGPT-like appearance**

Read the existing `src/views/chat/ChatView.vue`, then update the `<style scoped>` block. Keep the `<script>` and `<template>` as-is, replace only the styles.

The key changes in the style block:

```css
.chat-view {
  display: flex;
  height: calc(100vh - 104px);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.chat-sidebar {
  width: 260px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  font-size: 14px;
  color: #374151;
}

.session-item:hover { background: #e5e7eb; }
.session-item.active { background: #dbeafe; color: #1d4ed8; }

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.welcome-content {
  text-align: center;
  max-width: 480px;
  padding: 40px;
}

.welcome-content h2 {
  font-size: 24px;
  color: #1a1a2e;
  margin: 16px 0 8px;
  font-weight: 700;
}

.welcome-content p {
  color: #6b7280;
  margin-bottom: 28px;
  font-size: 15px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-btn {
  justify-content: flex-start;
  text-align: left;
  padding: 14px 18px;
  height: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #409EFF;
  background: #eff6ff;
  color: #409EFF;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

@media (max-width: 768px) {
  .chat-sidebar { display: none; }
  .messages-container { padding: 16px; }
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/views/chat/ChatView.vue
git commit -m "feat: redesign ChatView with ChatGPT-style clean interface"
```

---

### Task 7: Upgrade AssignmentView — Visual Refresh

**Files:**
- Modify: `src/views/assignment/AssignmentView.vue`

- [ ] **Step 1: Update AssignmentView card styles**

Read existing file, keep script/template, update styles. Replace the `<style scoped>` block with cleaner card design:

```css
.assignment-view {
  padding-bottom: 40px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.assignment-col {
  margin-bottom: 16px;
}

.assignment-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  border: 1px solid #f0f0f0;
}

.assignment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.subject-tag {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 3px 10px;
  border-radius: 6px;
}

.assignment-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.assignment-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.score-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar :deep(.el-progress) {
  flex: 1;
}

.score-text {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/views/assignment/AssignmentView.vue
git commit -m "feat: visual refresh for AssignmentView with cleaner card design"
```

---

### Task 8: Router & MainLayout — Wire Student Routes

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layout/MainLayout.vue`
- Delete: `src/views/dashboard/StudentDashboard.vue`

- [ ] **Step 1: Add student routes and update redirects in router**

Edit `src/router/index.ts`:

Add a new student layout route inside the `routes` array. After the existing `/login` and `/register` routes, add:

```typescript
{
  path: '/student',
  component: () => import('@/views/student/StudentLayout.vue'),
  redirect: '/student/questions',
  children: [
    {
      path: 'questions',
      name: 'QuestionBank',
      component: () => import('@/views/student/QuestionBank.vue'),
      meta: { title: '题库中心' }
    },
    {
      path: 'assignments',
      name: 'StudentAssignments',
      component: () => import('@/views/assignment/AssignmentView.vue'),
      meta: { title: '作业中心' }
    },
    {
      path: 'wrong-qs',
      name: 'StudentWrongQuestions',
      component: () => import('@/views/student/WrongQuestions.vue'),
      meta: { title: '错题集' }
    },
    {
      path: 'recommend',
      name: 'StudentRecommend',
      component: () => import('@/views/student/Recommend.vue'),
      meta: { title: '个性化推荐' }
    },
    {
      path: 'analysis',
      name: 'StudentAnalysis',
      component: () => import('@/views/analysis/StudentAnalysis.vue'),
      meta: { title: '学情分析' }
    },
    {
      path: 'chat',
      name: 'StudentChat',
      component: () => import('@/views/chat/ChatView.vue'),
      meta: { title: '智能答疑' }
    }
  ]
},
```

Also update the root route's role-based redirect for students to go to `/student`:

In `router.beforeEach`, update the student redirect from `/dashboard/student` to `/student`:

```typescript
// Change this line in the role-based redirect block:
return next('/student')  // was '/dashboard/student'
```

- [ ] **Step 2: Update MainLayout menu for students**

In `src/layout/MainLayout.vue`, update `menuItems` computed. When user role is student, show:

```typescript
const menuItems = computed(() => {
  if (user.value?.role === 'student') {
    return [
      { path: '/student', title: '学习中心', icon: 'HomeFilled' },
      { path: '/student/questions', title: '题库中心', icon: 'Collection' },
      { path: '/student/assignments', title: '作业中心', icon: 'Document' },
      { path: '/student/wrong-qs', title: '错题集', icon: 'WarningFilled' },
      { path: '/student/recommend', title: '个性化推荐', icon: 'MagicStick' },
      { path: '/student/analysis', title: '学情分析', icon: 'DataAnalysis' },
      { path: '/student/chat', title: '智能答疑', icon: 'ChatDotRound' }
    ]
  }

  // Non-student roles keep existing behavior
  const dashboardPath = user.value?.role === 'teacher' ? '/dashboard/teacher' :
    user.value?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'

  return [
    { path: dashboardPath, title: '工作台', icon: 'HomeFilled' },
    { path: '/chat', title: '智能答疑', icon: 'ChatDotRound' },
    { path: '/assignments', title: '作业中心', icon: 'Document' },
    { path: '/analysis/student', title: '学情分析', icon: 'TrendCharts' },
    ...(isAdmin.value ? [{ path: '/admin', title: '管理后台', icon: 'Setting' }] : [])
  ]
})
```

- [ ] **Step 3: Delete StudentDashboard.vue**

```bash
rm src/views/dashboard/StudentDashboard.vue
```

- [ ] **Step 4: Verify build**

Run: `npx vite build`
Expected: Build succeeds, no errors from missing imports.

- [ ] **Step 5: Commit**

```bash
git add src/router/index.ts src/layout/MainLayout.vue
git rm src/views/dashboard/StudentDashboard.vue
git commit -m "feat: wire student routes to six-module layout, remove old Dashboard"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Full build**

Run: `npm install && npx vite build`
Expected: Build succeeds. Check dist output includes student-related chunks.

- [ ] **Step 2: Dev server test**

Run: `npm run dev`
Navigate to `http://localhost:3000/student` — should see the tab layout with 6 tabs.
Navigate to each tab: questions, assignments, wrong-qs, recommend, analysis, chat.

- [ ] **Step 3: Verify role-based redirect**

Login as student → redirected to `/student`
Login as teacher → redirected to `/dashboard/teacher`
Login as admin → redirected to `/dashboard/admin`

- [ ] **Step 4: Commit any fixups**

```bash
git add -A
git commit -m "chore: final verification and adjustments for student module redesign"
```
