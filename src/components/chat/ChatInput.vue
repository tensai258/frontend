<script setup lang="ts">
import { ref, computed } from 'vue'

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
const isFocused = ref(false)

const hasText = computed(() => inputText.value.trim().length > 0)

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
  <div class="chat-input-container" :class="{ focused: isFocused, 'has-text': hasText }">
    <div class="input-inner">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        :placeholder="placeholder"
        :disabled="disabled"
        resize="none"
        class="custom-input"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <button
        class="send-btn"
        :class="{ active: hasText, loading: loading }"
        :disabled="disabled || !hasText"
        @click="handleSend"
      >
        <span v-if="loading" class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <svg v-else class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="input-footer">
      <div class="footer-left">
        <span class="footer-hint">按 Enter 发送</span>
        <span class="footer-dot">•</span>
        <span class="footer-hint">Shift + Enter 换行</span>
      </div>
      <div class="footer-right">
        <span class="char-count" v-if="hasText">{{ inputText.length }} 字</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  background: #fff;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  padding: 16px 20px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.chat-input-container:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.chat-input-container.focused {
  border-color: #3b82f6;
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.15);
}

.chat-input-container.has-text {
  border-color: #3b82f6;
}

.input-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.custom-input {
  flex: 1;
}

:deep(.custom-input .el-textarea__inner) {
  border: none !important;
  background: transparent !important;
  font-size: 15px;
  line-height: 1.6;
  padding: 8px 0;
  color: #1e293b;
  resize: none;
}

:deep(.custom-input .el-textarea__inner::placeholder) {
  color: #94a3b8;
}

:deep(.custom-input .el-textarea__inner:focus) {
  box-shadow: none !important;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.send-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.send-btn.active:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.send-btn:disabled {
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-hint {
  font-size: 12px;
  color: #94a3b8;
}

.footer-dot {
  color: #cbd5e1;
  font-size: 8px;
}

.footer-right {
  display: flex;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
  padding: 4px 10px;
  background: #f8fafc;
  border-radius: 12px;
}
</style>
