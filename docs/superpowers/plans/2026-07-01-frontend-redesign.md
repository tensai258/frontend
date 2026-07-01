# Frontend Redesign — Role-Specific Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current generic admin layout into three role-specific dashboards (Student/Teacher/Admin) with unified design language and CSS-variable-driven theme switching.

**Architecture:** Bottom-up component build. Shared dashboard components first, then three dashboard view pages composing them. CSS variables on `<html>` drive role theme switching. Existing routes and modules remain untouched — dashboard views are new additions, with root `/` redirecting by role.

**Tech Stack:** Vue 3 + TypeScript + Element Plus + ECharts + vue-echarts + Pinia

---

### Task 1: CSS Foundation — Theme Variables & Dashboard Styles

**Files:**
- Create: `src/styles/dashboard.css`
- Modify: `src/main.ts:1-19`

- [ ] **Step 1: Create dashboard.css with CSS variable definitions and shared styles**

Write `src/styles/dashboard.css`:

```css
/* ========================================
   智学伴行 Dashboard 设计系统
   ======================================== */

/* Role Theme Variables */
:root[data-role="student"] {
  --dashboard-primary: #4FACFE;
  --dashboard-primary-light: #4FACFE15;
  --dashboard-secondary: #00E5FF;
  --dashboard-accent: #FF6D00;
  --dashboard-gradient: linear-gradient(135deg, #4FACFE 0%, #00E5FF 100%);
}

:root[data-role="teacher"] {
  --dashboard-primary: #7C4DFF;
  --dashboard-primary-light: #7C4DFF15;
  --dashboard-secondary: #B388FF;
  --dashboard-accent: #FF4081;
  --dashboard-gradient: linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%);
}

:root[data-role="admin"] {
  --dashboard-primary: #546E7A;
  --dashboard-primary-light: #546E7A15;
  --dashboard-secondary: #90A4AE;
  --dashboard-accent: #FFAB00;
  --dashboard-gradient: linear-gradient(135deg, #546E7A 0%, #90A4AE 100%);
}

/* Default (student) */
:root {
  --dashboard-primary: #4FACFE;
  --dashboard-primary-light: #4FACFE15;
  --dashboard-secondary: #00E5FF;
  --dashboard-accent: #FF6D00;
  --dashboard-gradient: linear-gradient(135deg, #4FACFE 0%, #00E5FF 100%);

  --card-radius: 12px;
  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 4px 20px rgba(0, 0, 0, 0.1);
  --spacing: 24px;
  --text-primary: #1a1a2e;
  --text-secondary: #606266;
  --text-muted: #909399;
  --bg-page: #f0f2f5;
  --bg-card: #ffffff;
}

/* Dashboard Page Container */
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  max-width: 1400px;
}

/* Dashboard Card */
.dashboard-card {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--spacing);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.dashboard-card .card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Two Column Grid */
.dashboard-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing);
}

/* Action Buttons Row */
.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dashboard-actions .el-button {
  border-radius: 8px;
  font-weight: 500;
}

/* Stat Number */
.stat-number {
  font-size: 28px;
  font-weight: 700;
  font-feature-settings: "tnum";
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-change {
  font-size: 12px;
  margin-top: 6px;
}

.stat-change.up { color: #67C23A; }
.stat-change.down { color: #F56C6C; }

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid-2 {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Import dashboard.css in main.ts**

Edit `src/main.ts`, add the import after other CSS imports:

```
import 'element-plus/dist/index.css'
import './styles/dashboard.css'           // ← add this line
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with new CSS file included.

- [ ] **Step 4: Commit**

```bash
git add src/styles/dashboard.css src/main.ts
git commit -m "feat: add dashboard CSS foundation with role theme variables"
```

---

### Task 2: WelcomeBanner Component

**Files:**
- Create: `src/components/dashboard/WelcomeBanner.vue`

- [ ] **Step 1: Create WelcomeBanner.vue**

Write `src/components/dashboard/WelcomeBanner.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  suggestion?: string
}

const props = withDefaults(defineProps<Props>(), {
  suggestion: ''
})

const { user } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const today = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-bg"></div>
    <div class="welcome-content">
      <div class="welcome-text">
        <h1 class="welcome-greeting">
          {{ greeting }}，{{ user?.nickname || user?.username }}
        </h1>
        <p class="welcome-date">{{ today }}</p>
        <p v-if="suggestion" class="welcome-suggestion">{{ suggestion }}</p>
      </div>
      <div class="welcome-illustration">
        <slot name="illustration">
          <div class="default-illustration">
            <span class="illustration-emoji">📚</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-banner {
  position: relative;
  border-radius: var(--card-radius);
  overflow: hidden;
  padding: 32px var(--spacing);
  background: var(--dashboard-gradient);
  color: #fff;
}

.welcome-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%);
}

.welcome-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.welcome-greeting {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
}

.welcome-date {
  font-size: 14px;
  opacity: 0.85;
  margin: 0 0 12px;
}

.welcome-suggestion {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

.default-illustration {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-emoji {
  font-size: 40px;
}
</style>
```

- [ ] **Step 2: Verify component compiles**

Run: `npx vue-tsc --noEmit src/components/dashboard/WelcomeBanner.vue`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/WelcomeBanner.vue
git commit -m "feat: add WelcomeBanner dashboard component"
```

---

### Task 3: StatsRow Component

**Files:**
- Create: `src/components/dashboard/StatsRow.vue`

This reuses the existing `StatCard.vue` pattern in a 4-column grid.

- [ ] **Step 1: Create StatsRow.vue**

Write `src/components/dashboard/StatsRow.vue`:

```vue
<script setup lang="ts">
export interface StatItem {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: number
  trendText?: string
}

interface Props {
  items: StatItem[]
}

defineProps<Props>()
</script>

<template>
  <div class="stats-row">
    <div v-for="item in items" :key="item.title" class="stats-card">
      <div class="stats-icon" :style="{ backgroundColor: (item.color || 'var(--dashboard-primary)') + '15', color: item.color || 'var(--dashboard-primary)' }">
        <el-icon :size="24">
          <component :is="item.icon" />
        </el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-value" :style="{ color: item.color || 'var(--dashboard-primary)' }">
          {{ item.value }}
        </div>
        <div class="stats-title">{{ item.title }}</div>
        <div v-if="item.trend !== undefined" class="stat-change" :class="item.trend >= 0 ? 'up' : 'down'">
          <span>{{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%</span>
          <span class="trend-label">{{ item.trendText || '较上月' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing);
}

.stats-card {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 20px var(--spacing);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: default;
}

.stats-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-value {
  font-size: 26px;
  font-weight: 700;
  font-feature-settings: "tnum";
  margin-bottom: 2px;
}

.stats-title {
  font-size: 13px;
  color: var(--text-muted);
}

.trend-label {
  color: var(--text-muted);
  margin-left: 4px;
}

@media (max-width: 1000px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/StatsRow.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatsRow.vue
git commit -m "feat: add StatsRow dashboard component"
```

---

### Task 4: KnowledgeRadar Chart Component

**Files:**
- Create: `src/components/dashboard/KnowledgeRadar.vue`

- [ ] **Step 1: Create KnowledgeRadar.vue**

Write `src/components/dashboard/KnowledgeRadar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([RadarChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface KnowledgeItem {
  name: string
  mastery: number
  max: number
}

interface Props {
  data: KnowledgeItem[]
  title?: string
  weakThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '知识掌握度',
  weakThreshold: 50
})

const weakItems = computed(() =>
  props.data.filter(d => d.mastery < props.weakThreshold).map(d => d.name)
)

const chartOption = computed(() => ({
  title: {
    text: props.title,
    textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' },
    left: 'center'
  },
  tooltip: {
    formatter: (params: any) => {
      const val = params.value
      const color = val < props.weakThreshold ? '#F56C6C' : '#67C23A'
      return `<span style="color:${color};font-weight:600">${params.name}: ${val}%</span>`
    }
  },
  radar: {
    center: ['50%', '55%'],
    radius: '65%',
    indicator: props.data.map(d => ({ name: d.name, max: d.max })),
    axisName: { color: '#606266', fontSize: 13 }
  },
  series: [{
    type: 'radar',
    data: [{
      value: props.data.map(d => d.mastery),
      name: '掌握度',
      areaStyle: { color: 'var(--dashboard-primary)' },
      lineStyle: { color: 'var(--dashboard-primary)', width: 2 },
      itemStyle: { color: 'var(--dashboard-primary)' }
    }],
    symbol: 'circle',
    symbolSize: 6
  }]
}))
</script>

<template>
  <div class="dashboard-card">
    <div class="card-title">{{ title }}</div>
    <VChart :option="chartOption" style="height: 300px;" autoresize />
    <div v-if="weakItems.length" class="radar-weak">
      <el-icon color="#F56C6C"><WarningFilled /></el-icon>
      <span>薄弱知识点：<strong>{{ weakItems.join('、') }}</strong></span>
    </div>
  </div>
</template>

<style scoped>
.radar-weak {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 14px;
  background: #FEF0F0;
  border-radius: 8px;
  font-size: 13px;
  color: #F56C6C;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/KnowledgeRadar.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/KnowledgeRadar.vue
git commit -m "feat: add KnowledgeRadar chart component"
```

---

### Task 5: HeatmapChart Component

**Files:**
- Create: `src/components/dashboard/HeatmapChart.vue`

- [ ] **Step 1: Create HeatmapChart.vue**

Write `src/components/dashboard/HeatmapChart.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart as EHeatmap } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([EHeatmap, TooltipComponent, VisualMapComponent, GridComponent, CanvasRenderer])

interface Props {
  yAxis: string[]
  xAxis: string[]
  data: [number, number, number][]
  title?: string
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '知识点掌握热力图',
  tip: ''
})

const chartOption = computed(() => ({
  title: {
    text: props.title,
    textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' },
    left: 'center'
  },
  tooltip: {
    formatter: (params: any) =>
      `${params.name}<br/>掌握度: <strong>${params.value[2]}%</strong>`
  },
  grid: { left: 120, right: 60, top: 50, bottom: 50 },
  xAxis: {
    type: 'category',
    data: props.xAxis,
    axisLabel: { fontSize: 12 },
    splitArea: { show: true }
  },
  yAxis: {
    type: 'category',
    data: props.yAxis,
    axisLabel: { fontSize: 12 },
    splitArea: { show: true }
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    inRange: { color: ['#F56C6C', '#FFD54F', '#81C784', '#4CAF50'] }
  },
  series: [{
    type: 'heatmap',
    data: props.data,
    label: { show: true, fontSize: 11 },
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.25)' }
    }
  }]
}))
</script>

<template>
  <div class="dashboard-card">
    <div class="card-title">{{ title }}</div>
    <VChart :option="chartOption" style="height: 320px;" autoresize />
    <div v-if="tip" class="heatmap-tip">
      <el-icon color="var(--dashboard-accent)"><WarningFilled /></el-icon>
      <span>{{ tip }}</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 14px;
  background: #FFF8E1;
  border-radius: 8px;
  font-size: 13px;
  color: #E65100;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/HeatmapChart.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/HeatmapChart.vue
git commit -m "feat: add HeatmapChart component"
```

---

### Task 6: LearningPath Component

**Files:**
- Create: `src/components/dashboard/LearningPath.vue`

- [ ] **Step 1: Create LearningPath.vue**

Write `src/components/dashboard/LearningPath.vue`:

```vue
<script setup lang="ts">
interface PathStep {
  name: string
  mastery: number
  isCurrent: boolean
}

interface Props {
  steps: PathStep[]
  suggestion: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '个性化学习路径'
})
</script>

<template>
  <div class="dashboard-card">
    <div class="card-title">{{ title }}</div>
    <div class="learning-path">
      <div v-for="(step, i) in steps" :key="step.name" class="path-step-wrapper">
        <div
          class="path-step"
          :class="{
            'is-current': step.isCurrent,
            'is-done': step.mastery >= 80 && !step.isCurrent
          }"
        >
          <div class="step-indicator">
            <span v-if="step.mastery >= 80 && !step.isCurrent">✅</span>
            <span v-else-if="step.isCurrent" class="current-dot"></span>
            <span v-else class="future-dot"></span>
          </div>
          <div class="step-info">
            <div class="step-name">{{ step.name }}</div>
            <div class="step-mastery">
              <div class="mastery-bar">
                <div class="mastery-fill" :style="{ width: step.mastery + '%' }"></div>
              </div>
              <span class="mastery-text">{{ step.mastery }}%</span>
            </div>
          </div>
        </div>
        <div v-if="i < steps.length - 1" class="path-connector"></div>
      </div>
    </div>
    <div class="path-suggestion">
      <el-icon color="var(--dashboard-primary)"><InfoFilled /></el-icon>
      <span>{{ suggestion }}</span>
    </div>
  </div>
</template>

<style scoped>
.learning-path {
  padding: 8px 0;
}

.path-step-wrapper {
  position: relative;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.is-done .step-indicator {
  background: #E8F5E9;
}

.current-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dashboard-primary);
  box-shadow: 0 0 0 6px var(--dashboard-primary-light);
  animation: pulse-dot 2s infinite;
}

.future-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #DCDFE6;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 6px var(--dashboard-primary-light); }
  50% { box-shadow: 0 0 0 12px var(--dashboard-primary-light); }
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.is-done .step-name {
  color: var(--text-muted);
}

.is-current .step-name {
  color: var(--dashboard-primary);
  font-weight: 600;
}

.step-mastery {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mastery-bar {
  flex: 1;
  height: 6px;
  background: #EBEEF5;
  border-radius: 3px;
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  background: var(--dashboard-primary);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.is-done .mastery-fill {
  background: #67C23A;
}

.mastery-text {
  font-size: 12px;
  color: var(--text-muted);
  font-feature-settings: "tnum";
  width: 36px;
  text-align: right;
}

.path-connector {
  width: 2px;
  height: 20px;
  background: #EBEEF5;
  margin-left: 15px;
}

.path-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #ECF5FF;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/LearningPath.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/LearningPath.vue
git commit -m "feat: add LearningPath component"
```

---

### Task 7: RecommendCard Component

**Files:**
- Create: `src/components/dashboard/RecommendCard.vue`

- [ ] **Step 1: Create RecommendCard.vue**

Write `src/components/dashboard/RecommendCard.vue`:

```vue
<script setup lang="ts">
interface ExerciseItem {
  name: string
  count: number
  estimatedTime: number
}

interface Props {
  title?: string
  exercises: ExerciseItem[]
  totalTime: number
  reason?: string
}

withDefaults(defineProps<Props>(), {
  title: '今日推荐作业'
})

const emit = defineEmits<{
  start: []
}>()
</script>

<template>
  <div class="dashboard-card recommend-card">
    <div class="card-title">{{ title }}</div>

    <div class="recommend-list">
      <div v-for="item in exercises" :key="item.name" class="recommend-item">
        <el-icon :size="18" color="var(--dashboard-primary)"><Document /></el-icon>
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-meta">{{ item.count }}道题 · 约{{ item.estimatedTime }}分钟</span>
        </div>
      </div>
    </div>

    <div class="recommend-footer">
      <div class="total-time">
        <el-icon><Clock /></el-icon>
        预计总用时：<strong>{{ totalTime }}分钟</strong>
      </div>
      <el-button type="primary" size="large" round @click="emit('start')">
        开始练习
      </el-button>
    </div>

    <div v-if="reason" class="recommend-reason">
      <el-icon color="var(--dashboard-accent)"><InfoFilled /></el-icon>
      <span>{{ reason }}</span>
    </div>
  </div>
</template>

<style scoped>
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #F7F8FC;
  border-radius: 10px;
  transition: background 0.2s;
}

.recommend-item:hover {
  background: var(--dashboard-primary-light);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.recommend-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.total-time {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.recommend-reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  background: #FFF8E1;
  border-radius: 8px;
  font-size: 12px;
  color: #795548;
  line-height: 1.5;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/RecommendCard.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/RecommendCard.vue
git commit -m "feat: add RecommendCard component"
```

---

### Task 8: WrongQuestions & QuickActions Components

**Files:**
- Create: `src/components/dashboard/WrongQuestions.vue`
- Create: `src/components/dashboard/QuickActions.vue`

- [ ] **Step 1: Create WrongQuestions.vue**

Write `src/components/dashboard/WrongQuestions.vue`:

```vue
<script setup lang="ts">
export interface WrongQuestion {
  id: number
  title: string
  errorRate: number
}

interface Props {
  items: WrongQuestion[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '高频错题'
})
</script>

<template>
  <div class="dashboard-card">
    <div class="card-title">{{ title }}</div>
    <div class="wq-list">
      <div v-for="(item, i) in items" :key="item.id" class="wq-item">
        <span class="wq-rank" :class="{ 'top3': i < 3 }">{{ i + 1 }}</span>
        <div class="wq-info">
          <div class="wq-title">{{ item.title }}</div>
          <div class="wq-meta">
            <div class="wq-bar">
              <div class="wq-fill" :style="{ width: item.errorRate + '%' }"></div>
            </div>
            <span class="wq-rate">错误率 {{ item.errorRate }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wq-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wq-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.wq-rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  background: #EBEEF5;
  color: var(--text-muted);
  flex-shrink: 0;
}

.wq-rank.top3 {
  background: #FEF0F0;
  color: #F56C6C;
}

.wq-info {
  flex: 1;
  min-width: 0;
}

.wq-title {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wq-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wq-bar {
  flex: 1;
  height: 6px;
  background: #EBEEF5;
  border-radius: 3px;
  overflow: hidden;
}

.wq-fill {
  height: 100%;
  background: #F56C6C;
  border-radius: 3px;
}

.wq-rate {
  font-size: 12px;
  color: #F56C6C;
  font-feature-settings: "tnum";
  white-space: nowrap;
}
</style>
```

- [ ] **Step 2: Create QuickActions.vue**

Write `src/components/dashboard/QuickActions.vue`:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Action {
  label: string
  icon: string
  route?: string
  handler?: () => void
}

interface Props {
  actions: Action[]
}

defineProps<Props>()
const router = useRouter()

const handleClick = (action: Action) => {
  if (action.handler) {
    action.handler()
  } else if (action.route) {
    router.push(action.route)
  }
}
</script>

<template>
  <div class="dashboard-actions">
    <el-button
      v-for="action in actions"
      :key="action.label"
      size="large"
      @click="handleClick(action)"
    >
      <el-icon><component :is="action.icon" /></el-icon>
      {{ action.label }}
    </el-button>
  </div>
</template>
```

- [ ] **Step 3: Verify compilation**

Run: `npx vue-tsc --noEmit src/components/dashboard/WrongQuestions.vue src/components/dashboard/QuickActions.vue`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/WrongQuestions.vue src/components/dashboard/QuickActions.vue
git commit -m "feat: add WrongQuestions and QuickActions components"
```

---

### Task 9: StudentDashboard View

**Files:**
- Create: `src/views/dashboard/StudentDashboard.vue`

- [ ] **Step 1: Create StudentDashboard.vue**

Write `src/views/dashboard/StudentDashboard.vue`:

```vue
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
        <div class="card-title">💬 智能答疑</div>
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
        <div class="card-title">📝 待完成作业</div>
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
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/dashboard/StudentDashboard.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/dashboard/StudentDashboard.vue
git commit -m "feat: add StudentDashboard view"
```

---

### Task 10: TeacherDashboard View

**Files:**
- Create: `src/views/dashboard/TeacherDashboard.vue`

- [ ] **Step 1: Create TeacherDashboard.vue**

Write `src/views/dashboard/TeacherDashboard.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
import type { StatItem } from '@/components/dashboard/StatsRow.vue'
import HeatmapChart from '@/components/dashboard/HeatmapChart.vue'
import WrongQuestions from '@/components/dashboard/WrongQuestions.vue'
import type { WrongQuestion } from '@/components/dashboard/WrongQuestions.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

const router = useRouter()

const stats: StatItem[] = [
  { title: '学生总数', value: 128, icon: 'User', color: '#7C4DFF', trend: 3, trendText: '较上月' },
  { title: '平均成绩', value: '78.5', icon: 'TrendCharts', color: '#00C853', trend: 2.1, trendText: '较上月' },
  { title: '待批作业', value: '23份', icon: 'Document', color: '#FF6D00' },
  { title: '本月活跃度', value: '92%', icon: 'DataLine', color: '#4FACFE', trend: 12, trendText: '较上月' }
]

const heatmapX = ['学生A', '学生B', '学生C', '学生D', '学生E', '学生F', '学生G', '学生H', '学生I', '学生J']
const heatmapY = ['递归', '动态规划', '指针', '数组', '链表', '排序', '图论', '贪心']
const heatmapData: [number, number, number][] = []

for (let i = 0; i < heatmapY.length; i++) {
  for (let j = 0; j < heatmapX.length; j++) {
    heatmapData.push([j, i, Math.round(Math.random() * 60 + 30)])
  }
}

const wrongQuestions: WrongQuestion[] = [
  { id: 1, title: '递归遍历二叉树', errorRate: 78 },
  { id: 2, title: '动态规划状态方程设计', errorRate: 72 },
  { id: 3, title: '链表反转', errorRate: 65 },
  { id: 4, title: '排序算法复杂度分析', errorRate: 58 },
  { id: 5, title: '贪心策略证明', errorRate: 52 }
]

const heatmapTip = '"动态规划"全班薄弱，建议课堂教学重点强化'

const actions = [
  { label: '发布新作业', icon: 'Plus', route: '/assignments' },
  { label: '上传课程资料', icon: 'Upload', route: '/admin' },
  { label: '查看学情报告', icon: 'DataAnalysis', route: '/analysis/class' },
  { label: '进入答疑', icon: 'ChatDotRound', route: '/chat' }
]
</script>

<template>
  <div class="dashboard-page">
    <WelcomeBanner suggestion="本学期数据结构课程整体表现良好，动态规划模块需重点加强。" />

    <StatsRow :items="stats" />

    <HeatmapChart
      title="班级知识点掌握热力图"
      :x-axis="heatmapX"
      :y-axis="heatmapY"
      :data="heatmapData"
      :tip="heatmapTip"
    />

    <div class="dashboard-grid-2">
      <WrongQuestions :items="wrongQuestions" title="🔴 高频错题 Top5" />

      <div class="dashboard-card">
        <div class="card-title">📋 最近作业提交动态</div>
        <div class="activity-list">
          <div v-for="item in [
            { user: '张三', action: '提交了', target: '数据结构作业3', time: '2分钟前' },
            { user: '李四', action: '提交了', target: '算法设计作业2', time: '15分钟前' },
            { user: '王五', action: '逾期提交', target: '数据结构作业2', time: '1小时前' },
            { user: '赵六', action: '提交了', target: '数据结构作业3', time: '2小时前' },
            { user: '钱七', action: '提交了', target: '算法设计作业2', time: '3小时前' }
          ]" :key="item.user + item.target" class="activity-item">
            <el-avatar :size="28" style="font-size: 12px;">{{ item.user.charAt(0) }}</el-avatar>
            <span class="activity-text">
              <strong>{{ item.user }}</strong> {{ item.action }} {{ item.target }}
            </span>
            <span class="activity-time">{{ item.time }}</span>
          </div>
        </div>
        <el-button type="primary" link style="margin-top: 12px;" @click="router.push('/assignments')">
          查看全部提交 →
        </el-button>
      </div>
    </div>

    <QuickActions :actions="actions" />
  </div>
</template>

<style scoped>
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/dashboard/TeacherDashboard.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/dashboard/TeacherDashboard.vue
git commit -m "feat: add TeacherDashboard view"
```

---

### Task 11: AdminDashboard View

**Files:**
- Create: `src/views/dashboard/AdminDashboard.vue`

- [ ] **Step 1: Create AdminDashboard.vue**

Write `src/views/dashboard/AdminDashboard.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
import type { StatItem } from '@/components/dashboard/StatsRow.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

use([LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const stats: StatItem[] = [
  { title: '系统状态', value: '🟢 正常', icon: 'Monitor', color: '#00C853' },
  { title: '今日API调用', value: '12,456', icon: 'Connection', color: '#4FACFE' },
  { title: '在线用户', value: '89人', icon: 'User', color: '#7C4DFF' },
  { title: '存储使用', value: '67%', icon: 'Folder', color: '#FF6D00' }
]

const trendOption = ref({
  title: { text: '📈 用户增长趋势', textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' }, left: 'left' },
  grid: { left: 40, right: 20, top: 50, bottom: 30 },
  xAxis: { type: 'category', data: ['6/25', '6/26', '6/27', '6/28', '6/29', '6/30', '7/1'] },
  yAxis: { type: 'value' },
  series: [{
    data: [320, 328, 335, 342, 345, 350, 356],
    type: 'line',
    smooth: true,
    lineStyle: { color: '#4FACFE', width: 3 },
    itemStyle: { color: '#4FACFE' },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#4FACFE40' }, { offset: 1, color: '#4FACFE05' }] } }
  }]
})

const pieOption = ref({
  title: { text: '📊 API调用分布', textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' }, left: 'left' },
  tooltip: { formatter: '{b}: {c}次 ({d}%)' },
  series: [{
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['50%', '55%'],
    data: [
      { value: 4230, name: '智能答疑' },
      { value: 3120, name: '作业系统' },
      { value: 2450, name: '学情分析' },
      { value: 1890, name: '知识库' },
      { value: 766, name: '系统管理' }
    ],
    label: { fontSize: 12 },
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }
  }]
})

const logItems = [
  { content: '管理员添加了新课程"算法设计与分析"', time: '5分钟前' },
  { content: '用户张三修改了登录密码', time: '28分钟前' },
  { content: '系统自动备份完成', time: '1小时前' },
  { content: '教师王教授上传了课程资料', time: '2小时前' },
  { content: '系统检测到异常登录尝试已拦截', time: '3小时前' }
]

const actions = [
  { label: '用户管理', icon: 'User', route: '/admin' },
  { label: '系统配置', icon: 'Setting', route: '/admin' },
  { label: '知识库管理', icon: 'Folder', route: '/admin' },
  { label: '查看日志', icon: 'Document', route: '/admin' }
]
</script>

<template>
  <div class="dashboard-page">
    <WelcomeBanner suggestion="系统运行32天，各项指标正常。存储空间预计15天后需扩容。" />

    <StatsRow :items="stats" />

    <div class="dashboard-grid-2">
      <div class="dashboard-card">
        <VChart :option="trendOption" style="height: 280px;" autoresize />
      </div>
      <div class="dashboard-card">
        <VChart :option="pieOption" style="height: 280px;" autoresize />
      </div>
    </div>

    <div class="dashboard-grid-2">
      <div class="dashboard-card">
        <div class="card-title">📋 最近操作日志</div>
        <div class="log-list">
          <div v-for="(item, i) in logItems" :key="i" class="log-item">
            <el-icon color="#67C23A" v-if="i === 2"><CircleCheck /></el-icon>
            <el-icon color="#F56C6C" v-else-if="i === 4"><WarningFilled /></el-icon>
            <el-icon color="var(--dashboard-primary)" v-else><InfoFilled /></el-icon>
            <span class="log-text">{{ item.content }}</span>
            <span class="log-time">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-title">👥 用户概览</div>
        <div class="user-overview">
          <div class="user-stat">
            <span class="user-stat-num">356</span>
            <span class="user-stat-label">总用户</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">312</span>
            <span class="user-stat-label">学生</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">38</span>
            <span class="user-stat-label">教师</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">6</span>
            <span class="user-stat-label">管理员</span>
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <el-button size="small" @click="$router.push('/admin')">用户管理</el-button>
          <el-button size="small" @click="$router.push('/admin')">角色配置</el-button>
        </div>
      </div>
    </div>

    <QuickActions :actions="actions" />
  </div>
</template>

<style scoped>
.log-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.log-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.user-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing);
  text-align: center;
}

.user-stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--dashboard-primary);
  font-feature-settings: "tnum";
}

.user-stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `npx vue-tsc --noEmit src/views/dashboard/AdminDashboard.vue`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/dashboard/AdminDashboard.vue
git commit -m "feat: add AdminDashboard view"
```

---

### Task 12: Router & MainLayout — Wire Dashboards

**Files:**
- Modify: `src/router/index.ts:1-111`
- Modify: `src/layout/MainLayout.vue:1-205`

- [ ] **Step 1: Add dashboard routes in router/index.ts**

Edit `src/router/index.ts`. In the `routes` array, add dashboard route as a child of the root layout, and change the redirect logic.

Add these routes inside the `children` array of the `'/'` route (before the existing chat/assignments routes):

```typescript
{
  path: 'dashboard/student',
  name: 'StudentDashboard',
  component: () => import('@/views/dashboard/StudentDashboard.vue'),
  meta: { title: '学习Dashboard', icon: 'HomeFilled', roles: ['student'] }
},
{
  path: 'dashboard/teacher',
  name: 'TeacherDashboard',
  component: () => import('@/views/dashboard/TeacherDashboard.vue'),
  meta: { title: '教学Dashboard', icon: 'HomeFilled', roles: ['teacher'] }
},
{
  path: 'dashboard/admin',
  name: 'AdminDashboard',
  component: () => import('@/views/dashboard/AdminDashboard.vue'),
  meta: { title: '管理Dashboard', icon: 'HomeFilled', roles: ['admin'] }
},
```

Change the `redirect: '/chat'` to a function that redirects by role. Replace this line:

```
redirect: '/chat',
```

with a route guard approach. In the `children` array, we keep `redirect` at the path level but the role-based redirect should be handled differently. Instead, add a navigation guard at the top of the `router.beforeEach` to intercept the root `/` and redirect:

Add this at the start of the `router.beforeEach` callback (before the `if (to.meta.title)` line):

```typescript
// Role-based dashboard redirect
if (to.path === '/') {
  const role = userStore.user?.role
  if (role === 'teacher') return next('/dashboard/teacher')
  if (role === 'admin') return next('/dashboard/admin')
  return next('/dashboard/student')
}
```

Also update the `redirect` on the root route to `redirect: '/dashboard/student'`.

- [ ] **Step 2: Update MainLayout menu to include Dashboard**

Edit `src/layout/MainLayout.vue`. In the `menuItems` computed, add dashboard as first item:

```typescript
const menuItems = computed(() => {
  const dashboardPath =
    user.value?.role === 'teacher' ? '/dashboard/teacher' :
    user.value?.role === 'admin' ? '/dashboard/admin' :
    '/dashboard/student'

  return [
    { path: dashboardPath, title: '工作台', icon: 'HomeFilled' },
    { path: '/chat', title: '智能答疑', icon: 'ChatDotRound' },
    { path: '/assignments', title: '作业中心', icon: 'Document' },
    { path: '/analysis/student', title: '学情分析', icon: 'TrendCharts' },
    ...(isAdmin.value ? [{ path: '/admin', title: '管理后台', icon: 'Setting' }] : [])
  ]
})
```

- [ ] **Step 3: Add role theme attribute in MainLayout**

In `MainLayout.vue` `<script>`, add:

```typescript
import { watch } from 'vue'

const setTheme = (role: string | undefined) => {
  document.documentElement.dataset.role = role || 'student'
}

watch(() => user.value?.role, setTheme, { immediate: true })
```

- [ ] **Step 4: Verify compilation**

Run: `npx vue-tsc --noEmit`
Expected: No type errors across the project.

- [ ] **Step 5: Commit**

```bash
git add src/router/index.ts src/layout/MainLayout.vue
git commit -m "feat: wire dashboards into router and MainLayout with role-based redirect"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Install dependencies**

Run: `npm install`

- [ ] **Step 2: Build for production**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Start dev server and verify**

Run: `npm run dev`

Manual verification checklist:
- [ ] Login as student → redirected to StudentDashboard
- [ ] StudentDashboard shows: WelcomeBanner, RecommendCard, KnowledgeRadar, LearningPath, Chat input, Assignments
- [ ] Login as teacher → redirected to TeacherDashboard
- [ ] TeacherDashboard shows: WelcomeBanner, StatsRow, HeatmapChart, WrongQuestions, QuickActions
- [ ] Login as admin → redirected to AdminDashboard
- [ ] AdminDashboard shows: WelcomeBanner, StatsRow, trend/pie charts, logs, user overview
- [ ] Sidebar menu shows "工作台" as first item, navigating to correct role dashboard
- [ ] Theme colors switch correctly between roles (banner gradient, primary colors)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final verification and adjustments"
```
