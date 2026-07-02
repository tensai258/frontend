<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="empty-state">
    <el-icon :size="64" color="#C0C4CC"><FolderOpened /></el-icon>
    <h3>当前没有错题</h3>
    <p>请先去题库中心或完成作业再来</p>
    <div class="empty-actions">
      <el-button type="primary" @click="router.push('/student/questions')">去题库中心</el-button>
      <el-button @click="router.push('/student/assignments')">去作业中心</el-button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 80px 0;
}
.empty-state h3 { font-size: 18px; color: var(--text-primary); margin: 16px 0 8px; }
.empty-state p { color: var(--text-muted); margin-bottom: 24px; }
.empty-actions { display: flex; gap: 12px; justify-content: center; }
</style>
