<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="report-section">
    <h3 class="report-title">{{ title }}</h3>
    <div class="report-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.report-section {
  background: var(--bg-card);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 24px;
  margin-bottom: var(--spacing);
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.report-body {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}
</style>
