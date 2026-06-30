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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chat-sidebar {
  width: 260px;
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 4px;
  position: relative;
}

.session-item:hover {
  background: #e6f2ff;
}

.session-item.active {
  background: #cce5ff;
  color: #409EFF;
}

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
  position: relative;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  padding: 40px;
}

.welcome-content h2 {
  font-size: 24px;
  color: #303133;
  margin: 20px 0 12px;
}

.welcome-content p {
  color: #909399;
  margin-bottom: 32px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.quick-btn {
  justify-content: flex-start;
  text-align: left;
  padding: 12px 16px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.quick-btn:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}

@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
}
</style>
