import request from '../request'
import type { ChatMessage } from '@/types'

export interface ChatSession {
  id: string
  title: string
  updatedAt?: string
}

export const chatApi = {
  sendMessage(data: { message: string; sessionId?: string; courseId?: number; stream?: boolean }) {
    return request.post<{ reply: string; sessionId: string }>('/chat/sync', data)
  },

  getHistory(sessionId: string) {
    return request.get<ChatMessage[]>(`/chat/history/${sessionId}`)
  },

  createSession() {
    return request.post<string>('/chat/session')
  },

  deleteSession(sessionId: string) {
    return request.delete(`/chat/session/${sessionId}`)
  },

  getSessions() {
    return Promise.resolve([
      { id: 'sess_001', title: '默认会话', updatedAt: new Date().toISOString() }
    ])
  },

  getStreamUrl() {
    return '/api/chat/stream'
  }
}
