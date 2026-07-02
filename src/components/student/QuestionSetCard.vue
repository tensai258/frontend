<script setup lang="ts">
interface Props {
  id: number
  name: string
  difficulty: number
  totalCount: number
  doneCount: number
  correctRate: number
}

defineProps<Props>()
const emit = defineEmits<{ start: [id: number] }>()

const diffStars = (level: number) => '⭐'.repeat(level)
</script>

<template>
  <div class="qset-card" @click="emit('start', id)">
    <div class="qset-icon">📗</div>
    <div class="qset-info">
      <div class="qset-name">{{ name }}</div>
      <div class="qset-meta">
        <span>难度: {{ diffStars(difficulty) }}</span>
        <span>{{ totalCount }}题</span>
      </div>
      <div class="qset-progress" v-if="doneCount > 0">
        <span>已做: {{ doneCount }} | 正确率{{ correctRate }}%</span>
        <el-progress :percentage="correctRate" :stroke-width="6" :show-text="false" />
      </div>
    </div>
    <el-button type="primary" size="small" round>
      {{ doneCount > 0 ? '继续练习' : '开始练习' }}
    </el-button>
  </div>
</template>

<style scoped>
.qset-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.3s;
}

.qset-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.qset-icon { font-size: 32px; flex-shrink: 0; }

.qset-info { flex: 1; min-width: 0; }

.qset-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.qset-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.qset-progress {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
