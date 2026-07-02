<script setup lang="ts">
interface Props {
  id: number
  title: string
  source: 'question_bank' | 'assignment'
  sourceName: string
  knowledge: string
  wrongCount: number
  difficulty: number
  lastError?: string
  status: 'unfixed' | 'reviewing' | 'mastered'
}

defineProps<Props>()
const emit = defineEmits<{ retry: [id: number] }>()

const statusColors: Record<string, string> = {
  unfixed: '#F56C6C',
  reviewing: '#E6A23C',
  mastered: '#67C23A'
}

const diffStars = (level: number) => '⭐'.repeat(level)
</script>

<template>
  <div class="wq-card" :style="{ borderLeftColor: statusColors[status] }">
    <div class="wq-header">
      <span class="wq-status-dot" :style="{ background: statusColors[status] }"></span>
      <span class="wq-title">{{ title }}</span>
      <el-tag size="small" :type="source === 'assignment' ? 'warning' : ''">
        {{ source === 'assignment' ? '来自作业' : '来自题库' }}
      </el-tag>
    </div>
    <div class="wq-meta">
      <span>知识点: {{ knowledge }}</span>
      <span>做错 {{ wrongCount }} 次</span>
      <span>难度 {{ diffStars(difficulty) }}</span>
    </div>
    <div v-if="lastError" class="wq-reason">上次错误原因: "{{ lastError }}"</div>
    <el-button size="small" type="primary" plain round @click="emit('retry', id)">
      {{ status === 'mastered' ? '再次练习' : '重新作答' }}
    </el-button>
  </div>
</template>

<style scoped>
.wq-card {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 20px;
  border-left: 4px solid #ccc;
  transition: all 0.3s;
}

.wq-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.wq-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.wq-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wq-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.wq-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.wq-reason {
  font-size: 12px;
  color: var(--text-secondary);
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}
</style>
