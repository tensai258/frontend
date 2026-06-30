<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: number
  trendText?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409EFF'
})

const trendIcon = computed(() => props.trend && props.trend > 0 ? 'ArrowUp' : 'ArrowDown')
const trendColor = computed(() => props.trend && props.trend > 0 ? '#67C23A' : '#F56C6C')
</script>

<template>
  <el-card class="stat-card" shadow="hover">
    <div class="stat-content">
      <div class="stat-icon" :style="{ backgroundColor: color + '15', color: color }">
        <el-icon :size="28">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value" :style="{ color }">{{ value }}</div>
        <div v-if="trend !== undefined" class="stat-trend">
          <el-icon :size="12" :color="trendColor">
            <component :is="trendIcon" />
          </el-icon>
          <span :style="{ color: trendColor }">{{ Math.abs(trend) }}%</span>
          <span class="trend-text">{{ trendText }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-text {
  color: #909399;
  margin-left: 4px;
}
</style>
