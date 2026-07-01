<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart as EHeatmap } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { WarningFilled } from '@element-plus/icons-vue'

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
