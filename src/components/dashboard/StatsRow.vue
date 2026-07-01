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
