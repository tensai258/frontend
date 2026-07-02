<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useStreamChat } from '@/composables/useStreamChat'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import type { ChatMessage as ChatMessageType } from '@/types'

const chatStore = useChatStore()
const { sendStreamMessage, streaming } = useStreamChat()
const messagesContainer = ref<HTMLElement>()

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleSend = async (text: string) => {
  // 添加用户消息
  const userMsg: ChatMessageType = {
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
  }
  chatStore.addMessage(userMsg)
  await scrollToBottom()

  // 添加助手占位消息
  const assistantMsg: ChatMessageType = {
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: true
  }
  chatStore.addMessage(assistantMsg)
  await scrollToBottom()

  // 发送流式请求
  let fullContent = ''
  await sendStreamMessage(
    text,
    (chunk) => {
      fullContent += chunk
      chatStore.updateLastMessage(fullContent, true)
      scrollToBottom()
    },
    (full) => {
      chatStore.updateLastMessage(full, false)
      scrollToBottom()
    },
    (err) => {
      chatStore.updateLastMessage(`错误: ${err}`, false)
      scrollToBottom()
    }
  )
}

const handleNewChat = () => {
  chatStore.createNewSession()
}

onMounted(() => {
  chatStore.loadSessions()
})
</script>

<template>
  <div class="chat-view">
    <!-- 左侧会话列表 -->
    <div class="chat-sidebar">
      <el-button
        type="primary"
        class="new-chat-btn"
        @click="handleNewChat"
      >
        <el-icon><Plus /></el-icon>
        新对话
      </el-button>
      <div class="session-list">
        <div
          v-for="session in chatStore.sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === chatStore.currentSessionId }"
          @click="chatStore.loadHistory(session.id)"
        >
          <el-icon><ChatDotSquare /></el-icon>
          <span class="session-title">{{ session.title }}</span>
          <el-icon class="delete-btn" @click.stop="chatStore.deleteSession(session.id)">
            <Delete />
          </el-icon>
        </div>
        <el-empty v-if="chatStore.sessions.length === 0" description="暂无历史对话" />
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div v-if="chatStore.isEmpty" class="welcome-screen">
        <div class="welcome-content">
          <el-icon :size="64" color="#409EFF"><Cpu /></el-icon>
          <h2>AI 智能答疑助手</h2>
          <p>我可以帮助你解答学习中的问题，随时向我提问吧！</p>
          <div class="quick-actions">
            <el-button
              v-for="q in ['数学函数怎么理解？', '英语语法讲解', '物理力学公式']"
              :key="q"
              class="quick-btn"
              @click="handleSend(q)"
            >
              {{ q }}
            </el-button>
          </div>
        </div>
      </div>

      <div v-else ref="messagesContainer" class="messages-container">
        <ChatMessage
          v-for="(msg, index) in chatStore.currentMessages"
          :key="index"
          :message="msg"
        />
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <ChatInput
          :loading="streaming"
          :disabled="streaming"
          placeholder="输入你的问题，AI助手将为你解答..."
          @send="handleSend"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: calc(100vh - 104px);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.chat-sidebar {
  width: 260px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  font-size: 14px;
  color: #374151;
}

.session-item:hover { background: #e5e7eb; }
.session-item.active { background: #dbeafe; color: #1d4ed8; }

.session-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s;
  padding: 4px;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #F56C6C;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.welcome-content {
  text-align: center;
  max-width: 480px;
  padding: 40px;
}

.welcome-content h2 {
  font-size: 24px;
  color: #1a1a2e;
  margin: 16px 0 8px;
  font-weight: 700;
}

.welcome-content p {
  color: #6b7280;
  margin-bottom: 28px;
  font-size: 15px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-btn {
  justify-content: flex-start;
  text-align: left;
  padding: 14px 18px;
  height: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #409EFF;
  background: #eff6ff;
  color: #409EFF;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

@media (max-width: 768px) {
  .chat-sidebar { display: none; }
  .messages-container { padding: 16px; }
}
</style>
