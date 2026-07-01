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
