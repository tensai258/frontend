<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  placeholder: '输入你的问题...'
})

const emit = defineEmits<{
  send: [message: string]
}>()

const inputText = ref('')

const handleSend = () => {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chat-input-wrapper">
    <el-input
      v-model="inputText"
      type="textarea"
      :rows="3"
      :placeholder="placeholder"
      :disabled="disabled"
      resize="none"
      @keydown="handleKeydown"
    />
    <div class="input-actions">
      <span class="hint">按 Enter 发送，Shift + Enter 换行</span>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="disabled || !inputText.trim()"
        @click="handleSend"
      >
        <el-icon><Promotion /></el-icon>
        发送
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.chat-input-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-textarea__inner) {
  border: none;
  background: transparent;
  font-size: 15px;
  resize: none;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.hint {
  font-size: 12px;
  color: #C0C4CC;
}
</style>
