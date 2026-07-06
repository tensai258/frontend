<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { chatApi } from '@/api/modules/chat'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const chatStore = useChatStore()
const sending = ref(false)
const streaming = ref(false)
const messagesContainer = ref<HTMLElement>()

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleSend = async (text: string) => {
  chatStore.addMessage({
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
  })
  await scrollToBottom()

  chatStore.addMessage({
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: true
  })
  await scrollToBottom()

  sending.value = true
  try {
    const res = await chatApi.sendMessage({ message: text, sessionId: '', stream: false })
    const reply = (res as any).reply || res
    chatStore.setAssistantReply(String(reply))
  } catch (err: any) {
    chatStore.setAssistantReply('AI助手暂时不可用: ' + (err?.message || ''))
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

const handleNewChat = () => {
  chatStore.createNewSession()
}

const quickQuestions = [
  { icon: '⏱️', text: '什么是时间复杂度？', color: '#409EFF' },
  { icon: '🌳', text: '二叉树的遍历方式有哪些？', color: '#67C23A' },
  { icon: '🔄', text: '快速排序的原理是什么？', color: '#E6A23C' },
  { icon: '📊', text: '数组和链表的区别？', color: '#F56C6C' }
]

onMounted(() => {
  chatStore.loadSessions()
})
</script>

<template>
  <div class="chat-view">
    <!-- 左侧会话列表 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">🤖</div>
          <span class="logo-text">AI 助手</span>
        </div>
        <button class="new-chat-btn" @click="handleNewChat">
          <span class="btn-icon">+</span>
          <span>新对话</span>
        </button>
      </div>
      
      <div class="session-list">
        <div
          v-for="session in chatStore.sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === chatStore.currentSessionId }"
          @click="chatStore.loadHistory(session.id)"
        >
          <span class="session-icon">💬</span>
          <span class="session-title">{{ session.title }}</span>
          <button class="delete-btn" @click.stop="chatStore.deleteSession(session.id)">×</button>
        </div>
        <div v-if="chatStore.sessions.length === 0" class="empty-sessions">
          <span class="empty-icon">📝</span>
          <span class="empty-text">暂无历史对话</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="ai-status">
          <span class="status-dot"></span>
          <span class="status-text">AI 在线</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 欢迎屏幕 -->
      <div v-if="chatStore.isEmpty" class="welcome-screen">
        <div class="welcome-content">
          <div class="ai-avatar-large">
            <div class="avatar-ring"></div>
            <div class="avatar-core">🧠</div>
          </div>
          <h1 class="welcome-title">AI 智能答疑助手</h1>
          <p class="welcome-desc">我可以帮助你解答学习中的问题，随时向我提问吧！</p>
          
          <div class="quick-questions">
            <h3 class="quick-title">试试这些热门问题</h3>
            <div class="quick-grid">
              <button
                v-for="q in quickQuestions"
                :key="q.text"
                class="quick-card"
                @click="handleSend(q.text)"
              >
                <span class="quick-icon">{{ q.icon }}</span>
                <span class="quick-text">{{ q.text }}</span>
                <span class="quick-arrow">→</span>
              </button>
            </div>
          </div>

          <div class="feature-tags">
            <span class="feature-tag">📚 数据结构</span>
            <span class="feature-tag">🔢 算法分析</span>
            <span class="feature-tag">💻 编程答疑</span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else ref="messagesContainer" class="messages-container">
        <ChatMessage
          v-for="(msg, index) in chatStore.currentMessages"
          :key="index"
          :message="msg"
        />
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-wrapper">
          <ChatInput
            :loading="streaming"
            :disabled="streaming"
            placeholder="输入你的问题，AI助手将为你解答..."
            @send="handleSend"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: calc(100vh - 104px);
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 侧边栏样式 */
.chat-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.sidebar-header {
  margin-bottom: 24px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.new-chat-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.session-list::-webkit-scrollbar {
  width: 4px;
}

.session-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  font-size: 14px;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.session-item.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  color: #fff;
}

.session-icon {
  font-size: 16px;
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
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  border-radius: 6px;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 13px;
  color: #22c55e;
  font-weight: 500;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* 欢迎屏幕 */
.welcome-screen {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 40px;
  overflow-y: auto;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.ai-avatar-large {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 32px;
}

.avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #3b82f6;
  border-right-color: #8b5cf6;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-core {
  position: absolute;
  inset: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.welcome-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-desc {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 40px;
  line-height: 1.6;
}

.quick-questions {
  margin-bottom: 32px;
}

.quick-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 20px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-card:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.quick-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.quick-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  line-height: 1.4;
}

.quick-arrow {
  font-size: 18px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.quick-card:hover .quick-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

.feature-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
}

/* 输入区域 */
.input-area {
  flex-shrink: 0;
  padding: 20px 40px 16px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
  
  .welcome-screen {
    padding: 24px;
  }
  
  .quick-grid {
    grid-template-columns: 1fr;
  }
  
  .messages-container {
    padding: 20px;
  }
  
  .input-area {
    padding: 16px 20px 12px;
  }
}
</style>
