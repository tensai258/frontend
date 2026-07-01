<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Action {
  label: string
  icon: string
  route?: string
  handler?: () => void
}

interface Props {
  actions: Action[]
}

defineProps<Props>()
const router = useRouter()

const handleClick = (action: Action) => {
  if (action.handler) {
    action.handler()
  } else if (action.route) {
    router.push(action.route)
  }
}
</script>

<template>
  <div class="dashboard-actions">
    <el-button
      v-for="action in actions"
      :key="action.label"
      size="large"
      @click="handleClick(action)"
    >
      <el-icon><component :is="action.icon" /></el-icon>
      {{ action.label }}
    </el-button>
  </div>
</template>
