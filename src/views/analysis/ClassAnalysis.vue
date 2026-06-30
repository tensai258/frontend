<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { analysisApi } from '@/api/modules/analysis'
import type { ClassAnalysisData } from '@/types'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer, BarChart, PieChart,
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, VisualMapComponent
])

const classData = ref<ClassAnalysisData | null>(null)
const loading = ref(false)

const distributionOption = ref({})
const comparisonOption = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const res = await analysisApi.getClassAnalysis(1)
    classData.value = res
    updateCharts(res)
  } catch {
    // 后端接口失败时使用模拟数据
    classData.value = mockClassData
    updateCharts(mockClassData)
  } finally {
    loading.value = false
  }
}

// 模拟数据
const mockClassData: ClassAnalysisData = {
  className: '计算机2401班',
  avgScore: 72.5,
  passRate: 78.5,
  excellentRate: 23.5,
  scoreDistribution: [
    { range: '0-59', count: 10 },
    { range: '60-69', count: 12 },
    { range: '70-79', count: 15 },
    { range: '80-89', count: 10 },
    { range: '90-100', count: 8 }
  ],
  subjectComparison: [
    { subject: '数据结构', avg: 75.2 },
    { subject: '高等数学', avg: 68.5 },
    { subject: '操作系统', avg: 70.8 },
    { subject: '计算机网络', avg: 73.1 },
    { subject: '组成原理', avg: 72.0 }
  ]
}

const updateCharts = (data: ClassAnalysisData) => {
  // 分数分布饼图
  distributionOption.value = {
    title: { text: '分数段分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{c}人' },
      data: data.scoreDistribution.map((item) => ({
        name: item.range,
        value: item.count
      }))
    }]
  }

  // 科目对比柱状图
  comparisonOption.value = {
    title: { text: '各科目平均分对比', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.subjectComparison.map((i) => i.subject) },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [{
      type: 'bar',
      data: data.subjectComparison.map((i) => ({
        value: i.avg,
        itemStyle: {
          color: i.avg >= 80 ? '#67C23A' : i.avg >= 60 ? '#E6A23C' : '#F56C6C'
        }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', formatter: '{c}' }
    }]
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="class-analysis" v-loading="loading">
    <PageHeader title="班级学情分析" description="查看班级整体学习情况" />

    <!-- 概览统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <StatCard
          title="班级平均分"
          :value="classData?.avgScore || 0"
          icon="DataAnalysis"
          color="#409EFF"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="及格率"
          :value="`${classData?.passRate || 0}%`"
          icon="CircleCheck"
          color="#67C23A"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="优秀率"
          :value="`${classData?.excellentRate || 0}%`"
          icon="Star"
          color="#E6A23C"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          title="班级人数"
          :value="classData?.scoreDistribution.reduce((a, b) => a + b.count, 0) || 0"
          icon="UserFilled"
          color="#909399"
        />
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <v-chart class="chart" :option="distributionOption" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <v-chart class="chart" :option="comparisonOption" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.class-analysis {
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
</style>
