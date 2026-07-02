<script setup lang="ts">
import { computed } from 'vue'
import ReportSection from '@/components/student/ReportSection.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, CanvasRenderer])

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
        建议重点复习：<strong>动态规划、递归算法</strong>
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
      <p class="trend-conclusion">趋势：稳步上升</p>
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
