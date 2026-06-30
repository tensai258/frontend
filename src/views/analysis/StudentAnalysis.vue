<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { analysisApi } from '@/api/modules/analysis'
import type { AnalysisData } from '@/types'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, LineChart, HeatmapChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, PolarComponent, VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer, RadarChart, LineChart, HeatmapChart,
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, PolarComponent, VisualMapComponent
])

const analysisData = ref<AnalysisData | null>(null)
const loading = ref(false)

const radarOption = ref({})
const trendOption = ref({})
const heatmapOption = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const res = await analysisApi.getStudentAnalysis(1)
    analysisData.value = res
    updateCharts(res)
  } catch {
    // 后端接口失败时使用模拟数据
    analysisData.value = mockAnalysisData
    updateCharts(mockAnalysisData)
  } finally {
    loading.value = false
  }
}

// 模拟数据
const mockAnalysisData: AnalysisData = {
  radarData: {
    indicator: [
      { name: '算法能力', max: 100 },
      { name: '编程能力', max: 100 },
      { name: '理论基础', max: 100 },
      { name: '问题分析', max: 100 },
      { name: '实践应用', max: 100 },
      { name: '创新思维', max: 100 }
    ],
    value: [75, 82, 68, 70, 78, 65],
    average: [70, 72, 75, 68, 73, 70]
  },
  trendData: {
    dates: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
    scores: [65, 72, 68, 78, 75, 82, 80, 85],
    classAverage: [62, 65, 68, 70, 72, 73, 75, 76]
  },
  heatmapData: {
    subjects: ['数据结构', '高等数学', '操作系统', '计算机网络', '组成原理'],
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    data: [
      [0, 0, 5], [1, 0, 3], [2, 0, 4], [3, 0, 2], [4, 0, 6],
      [0, 1, 4], [1, 1, 6], [2, 1, 3], [3, 1, 5], [4, 1, 2],
      [0, 2, 3], [1, 2, 2], [2, 2, 7], [3, 2, 4], [4, 2, 5],
      [0, 3, 6], [1, 3, 4], [2, 3, 5], [3, 3, 3], [4, 3, 6],
      [0, 4, 2], [1, 4, 5], [2, 4, 3], [3, 4, 7], [4, 4, 4],
      [0, 5, 8], [1, 5, 6], [2, 5, 5], [3, 5, 6], [4, 5, 8],
      [0, 6, 7], [1, 6, 4], [2, 6, 6], [3, 6, 5], [4, 6, 7]
    ]
  },
  overview: {
    totalScore: 680,
    rank: 12,
    classSize: 45,
    completionRate: 85,
    avgScore: 75.5
  }
}

const updateCharts = (data: AnalysisData) => {
  // 雷达图
  radarOption.value = {
    title: { text: '能力雷达图', left: 'center' },
    tooltip: {},
    legend: { data: ['我的能力', '班级平均'], bottom: 0 },
    radar: {
      indicator: data.radarData.indicator,
      radius: '65%'
    },
    series: [{
      type: 'radar',
      data: [
        { value: data.radarData.value, name: '我的能力', areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }, lineStyle: { color: '#409EFF' } },
        { value: data.radarData.average, name: '班级平均', areaStyle: { color: 'rgba(103, 194, 58, 0.2)' }, lineStyle: { color: '#67C23A' } }
      ]
    }]
  }

  // 趋势图
  trendOption.value = {
    title: { text: '成绩趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['我的成绩', '班级平均'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: data.trendData.dates },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [
      {
        name: '我的成绩',
        type: 'line',
        data: data.trendData.scores,
        smooth: true,
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
        lineStyle: { color: '#409EFF' },
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '班级平均',
        type: 'line',
        data: data.trendData.classAverage,
        smooth: true,
        lineStyle: { color: '#67C23A', type: 'dashed' },
        itemStyle: { color: '#67C23A' }
      }
    ]
  }

  // 热力图
  heatmapOption.value = {
    title: { text: '学习活跃度热力图', left: 'center' },
    tooltip: { position: 'top' },
    grid: { left: '3%', right: '8%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.heatmapData.subjects, splitArea: { show: true } },
    yAxis: { type: 'category', data: data.heatmapData.days, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#f0f9ff', '#bae0ff', '#409EFF', '#096dd9'] }
    },
    series: [{
      type: 'heatmap',
      data: data.heatmapData.data,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="student-analysis" v-loading="loading">
    <PageHeader title="个人学情分析" description="全面了解你的学习情况" />

    <!-- 概览统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <StatCard
          title="总分"
          :value="analysisData?.overview.totalScore || 0"
          icon="Trophy"
          color="#E6A23C"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="班级排名"
          :value="`${analysisData?.overview.rank || 0}/${analysisData?.overview.classSize || 0}`"
          icon="Medal"
          color="#F56C6C"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="作业完成率"
          :value="`${analysisData?.overview.completionRate || 0}%`"
          icon="Checked"
          color="#67C23A"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="平均分"
          :value="analysisData?.overview.avgScore || 0"
          icon="DataLine"
          color="#409EFF"
        />
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <v-chart class="chart" :option="radarOption" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <v-chart class="chart" :option="trendOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <v-chart class="chart heatmap-chart" :option="heatmapOption" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.student-analysis {
  padding-bottom: 40px;
}

.stats-row {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.chart {
  height: 350px;
}

.heatmap-chart {
  height: 300px;
}
</style>
