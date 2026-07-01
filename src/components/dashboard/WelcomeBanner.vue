<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  suggestion?: string
}

const props = withDefaults(defineProps<Props>(), {
  suggestion: ''
})

const { user } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const today = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-bg"></div>
    <div class="welcome-content">
      <div class="welcome-text">
        <h1 class="welcome-greeting">
          {{ greeting }}，{{ user?.nickname || user?.username }}
        </h1>
        <p class="welcome-date">{{ today }}</p>
        <p v-if="suggestion" class="welcome-suggestion">{{ suggestion }}</p>
      </div>
      <div class="welcome-illustration">
        <slot name="illustration">
          <div class="default-illustration">
            <span class="illustration-emoji">📚</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-banner {
  position: relative;
  border-radius: var(--card-radius);
  overflow: hidden;
  padding: 32px var(--spacing);
  background: var(--dashboard-gradient);
  color: #fff;
}

.welcome-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%);
}

.welcome-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.welcome-greeting {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
}

.welcome-date {
  font-size: 14px;
  opacity: 0.85;
  margin: 0 0 12px;
}

.welcome-suggestion {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

.default-illustration {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-emoji {
  font-size: 40px;
}
</style>
