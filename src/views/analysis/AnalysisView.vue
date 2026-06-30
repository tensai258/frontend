<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="analysis-view">
    <el-tabs :model-value="route.path" type="border-card" class="analysis-tabs">
      <el-tab-pane label="个人分析" name="/analysis/student">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="班级分析" name="/analysis/class">
        <router-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.analysis-view {
  padding-bottom: 40px;
}

.analysis-tabs {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
