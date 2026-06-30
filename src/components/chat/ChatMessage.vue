<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/types'
import { formatDate } from '@/utils/format'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')

const formattedTime = computed(() => {
  if (!props.message.timestamp) return ''
  return formatDate(props.message.timestamp, 'HH:mm')
})
</script>

<template>
  <div class="message-wrapper" :class="{ 'user-message': isUser, 'assistant-message': isAssistant }">
    <div class="message-avatar">
      <el-avatar
        :size="36"
        :icon="isUser ? 'UserFilled' : 'Cpu'"
        :class="isUser ? 'user-avatar' : 'ai-avatar'"
      />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ isUser ? '我' : 'AI助手' }}</span>
        <span v-if="formattedTime" class="message-time">{{ formattedTime }}</span>
      </div>
      <div class="message-body" :class="{ streaming: message.isStreaming }">
        <div class="text-content">{{ message.content }}</div>
        <div v-if="message.isStreaming" class="typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  align-items: flex-end;
}

.user-message .message-body {
  background: linear-gradient(135deg, #409EFF 0%, #5B8FF9 100%);
  color: #fff;
  border-radius: 16px 16px 4px 16px;
}

.message-avatar {
  flex-shrink: 0;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai-avatar {
  background: linear-gradient(135deg, #409EFF 0%, #36cfc9 100%);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.message-role {
  font-weight: 500;
  color: #606266;
}

.user-message .message-role {
  color: #409EFF;
}

.message-time {
  color: #C0C4CC;
}

.message-body {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
}

.text-content {
  white-space: pre-wrap;
}

.streaming {
  min-height: 40px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-left: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #C0C4CC;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
}
</style>
