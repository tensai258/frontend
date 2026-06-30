<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="page-header">
    <h2 class="title">{{ title }}</h2>
    <p v-if="description" class="description">{{ description }}</p>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}
</style>
