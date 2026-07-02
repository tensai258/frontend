<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { analysisApi } from '@/api/modules/analysis'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import ReportSection from '@/components/student/ReportSection.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, CanvasRenderer])

const userStore = useUserStore()

interface AnalysisData {
  overallScore?: number
  totalQuestions?: number
  correctQuestions?: number
  wrongQuestions?: number
  correctRate?: number
  knowledgeMastery?: Array<{
    knowledgeName: string
    masteryRate: number
    level: string
    totalQuestions: number
  }>
  trend?: Array<{
    date: string
    correctRate: number
    totalCount: number
  }>
  weakPoints?: string[]
  strongPoints?: string[]
  suggestion?: string
}

const analysis = ref<AnalysisData | null>(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const studentId = userStore.user?.id
    if (studentId) {
      const res = await analysisApi.getStudentAnalysis(studentId) as any
      analysis.value = res
    }
  } catch {
    ElMessage.error('加载分析数据失败，请确保已登录且后端服务已启动')
  } finally {
    loading.value = false
  }
}

const gradeFromRate = (rate?: number) => {
  if (!rate) return 'N/A'
  if (rate >= 90) return 'A'
  if (rate >= 80) return 'B+'
  if (rate >= 70) return 'B'
  if (rate >= 60) return 'C'
  return 'D'
}

const levelText = (level?: string) => {
  const map: Record<string, string> = { '优秀': '优秀', '良好': '良好', '中等': '一般', '薄弱': '薄弱', '未掌握': '需加强' }
  return map[level || ''] || level || '未知'
}

const levelStars = (rate?: number) => {
  if (!rate) return '⭐'
  if (rate >= 90) return '⭐⭐⭐⭐⭐'
  if (rate >= 80) return '⭐⭐⭐⭐'
  if (rate >= 70) return '⭐⭐⭐'
  if (rate >= 60) return '⭐⭐'
  return '⭐'
}

const trendOption = computed(() => {
  const trend = analysis.value?.trend || []
  return {
    grid: { left: 30, right: 20, top: 10, bottom: 20 },
    xAxis: { type: 'category', data: trend.map(t => t.date), axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 12 } },
    series: [{
      data: trend.map(t => t.correctRate),
      type: 'line',
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF' },
      areaStyle: { color: 'rgba(64,158,255,0.08)' }
    }]
  }
})

onMounted(fetchData)
</script>

<template>
  <div class="analysis-report" v-loading="loading">
    <div class="report-header">
      <h2>学习报告</h2>
      <span class="report-period">{{ new Date().toLocaleDateString() }}</span>
    </div>

    <ReportSection title="总体表现">
      <p>本学期完成 <strong>{{ analysis?.totalQuestions || 0 }}</strong> 道题目，
        正确 <strong>{{ analysis?.correctQuestions || 0 }}</strong> 道，
        错误 <strong>{{ analysis?.wrongQuestions || 0 }}</strong> 道。</p>
      <div class="grade-row">
        <div class="grade-badge">{{ gradeFromRate(analysis?.correctRate) }}</div>
        <div class="grade-meta">
          <div>正确率：<strong>{{ analysis?.correctRate?.toFixed(1) || '0' }}%</strong></div>
          <div>答题总数：<strong>{{ analysis?.totalQuestions || 0 }}</strong></div>
          <div>综合得分：<strong>{{ analysis?.overallScore?.toFixed(0) || '0' }}</strong></div>
        </div>
      </div>
    </ReportSection>

    <ReportSection title="知识点掌握情况">
      <div class="knowledge-list">
        <div v-for="k in (analysis?.knowledgeMastery || [])" :key="k.knowledgeName" class="knowledge-row">
          <span class="k-stars">{{ levelStars(k.masteryRate) }}</span>
          <span class="k-name">{{ k.knowledgeName }}</span>
          <span class="k-label" :class="{ weak: (k.masteryRate || 0) < 60 }">{{ levelText(k.level) }} ({{ k.masteryRate?.toFixed(0) || 0 }}%)</span>
        </div>
      </div>
      <div v-if="analysis?.weakPoints?.length" class="k-tip">
        建议重点复习：<strong>{{ analysis?.weakPoints?.join('、') }}</strong>
      </div>
      <div v-if="analysis?.suggestion" class="k-tip" style="background: #f0f5ff; color: #409EFF; margin-top: 8px;">
        {{ analysis.suggestion }}
      </div>
    </ReportSection>

    <ReportSection title="近期趋势" v-if="analysis?.trend?.length">
      <VChart :option="trendOption" style="height: 200px;" autoresize />
    </ReportSection>

    <ReportSection title="强项知识点" v-if="analysis?.strongPoints?.length">
      <p>
        <el-tag v-for="pt in analysis.strongPoints" :key="pt" type="success" size="small" style="margin-right: 8px;">{{ pt }}</el-tag>
      </p>
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
