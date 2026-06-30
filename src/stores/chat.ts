import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types'
import { chatApi } from '@/api/modules/chat'

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
}

export const useChatStore = defineStore('chat', () => {
  // State
  const sessions = ref<ChatSession[]>([])
  const currentSessionId = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const streaming = ref(false)

  // Getters
  const currentSession = computed(() =>
    sessions.value.find((s) => s.id === currentSessionId.value)
  )

  const currentMessages = computed(() => messages.value)

  const isEmpty = computed(() => messages.value.length === 0)

  // Actions
  const loadSessions = async () => {
    try {
      const res = await chatApi.getSessions()
      sessions.value = (res as unknown as ChatSession[]).map((s) => ({
        ...s,
        messages: []
      }))
    } catch {
      // 后端没有会话列表接口时，使用模拟数据
      sessions.value = [
        { id: 'sess_001', title: '数据结构-递归问题', messages: [], updatedAt: '2026-06-28 14:30' },
        { id: 'sess_002', title: '高数-导数应用', messages: [], updatedAt: '2026-06-27 09:15' }
      ]
    }
  }

  const loadHistory = async (sessionId?: string) => {
    loading.value = true
    try {
      if (sessionId) {
        const res = await chatApi.getHistory(sessionId)
        messages.value = res as unknown as ChatMessage[]
        currentSessionId.value = sessionId
      }
    } catch {
      messages.value = []
    } finally {
      loading.value = false
    }
  }

  const addMessage = (message: ChatMessage) => {
    messages.value.push(message)
  }

  const updateLastMessage = (content: string, isStreaming = false) => {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content = content
      lastMsg.isStreaming = isStreaming
    }
  }

  const setStreaming = (value: boolean) => {
    streaming.value = value
  }

  const createNewSession = () => {
    currentSessionId.value = null
    messages.value = []
  }

  const deleteSession = async (sessionId: string) => {
    await chatApi.deleteSession(sessionId)
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (currentSessionId.value === sessionId) {
      createNewSession()
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  return {
    sessions,
    currentSessionId,
    messages,
    loading,
    streaming,
    currentSession,
    currentMessages,
    isEmpty,
    loadSessions,
    loadHistory,
    addMessage,
    updateLastMessage,
    setStreaming,
    createNewSession,
    deleteSession,
    clearMessages
  }
})
