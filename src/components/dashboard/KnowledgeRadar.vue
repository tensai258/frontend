<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { WarningFilled } from '@element-plus/icons-vue'

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
