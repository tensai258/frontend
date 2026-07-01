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
