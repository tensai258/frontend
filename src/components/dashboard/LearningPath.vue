<script setup lang="ts">
interface PathStep {
  name: string
  mastery: number
  isCurrent: boolean
}

interface Props {
  steps: PathStep[]
  suggestion: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '个性化学习路径'
})
</script>

<template>
  <div class="dashboard-card">
    <div class="card-title">{{ title }}</div>
    <div class="learning-path">
      <div v-for="(step, i) in steps" :key="step.name" class="path-step-wrapper">
        <div
          class="path-step"
          :class="{
            'is-current': step.isCurrent,
            'is-done': step.mastery >= 80 && !step.isCurrent
          }"
        >
          <div class="step-indicator">
            <span v-if="step.mastery >= 80 && !step.isCurrent">✅</span>
            <span v-else-if="step.isCurrent" class="current-dot"></span>
            <span v-else class="future-dot"></span>
          </div>
          <div class="step-info">
            <div class="step-name">{{ step.name }}</div>
            <div class="step-mastery">
              <div class="mastery-bar">
                <div class="mastery-fill" :style="{ width: step.mastery + '%' }"></div>
              </div>
              <span class="mastery-text">{{ step.mastery }}%</span>
            </div>
          </div>
        </div>
        <div v-if="i < steps.length - 1" class="path-connector"></div>
      </div>
    </div>
    <div class="path-suggestion">
      <el-icon color="var(--dashboard-primary)"><InfoFilled /></el-icon>
      <span>{{ suggestion }}</span>
    </div>
  </div>
</template>

<style scoped>
.learning-path {
  padding: 8px 0;
}

.path-step-wrapper {
  position: relative;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.is-done .step-indicator {
  background: #E8F5E9;
}

.current-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dashboard-primary);
  box-shadow: 0 0 0 6px var(--dashboard-primary-light);
  animation: pulse-dot 2s infinite;
}

.future-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #DCDFE6;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 6px var(--dashboard-primary-light); }
  50% { box-shadow: 0 0 0 12px var(--dashboard-primary-light); }
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.is-done .step-name {
  color: var(--text-muted);
}

.is-current .step-name {
  color: var(--dashboard-primary);
  font-weight: 600;
}

.step-mastery {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mastery-bar {
  flex: 1;
  height: 6px;
  background: #EBEEF5;
  border-radius: 3px;
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  background: var(--dashboard-primary);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.is-done .mastery-fill {
  background: #67C23A;
}

.mastery-text {
  font-size: 12px;
  color: var(--text-muted);
  font-feature-settings: "tnum";
  width: 36px;
  text-align: right;
}

.path-connector {
  width: 2px;
  height: 20px;
  background: #EBEEF5;
  margin-left: 15px;
}

.path-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #ECF5FF;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
