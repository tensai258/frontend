import request from '../request'

export interface KnowledgeDoc {
  id: number
  title: string
  courseId: number
  fileName?: string
  size?: number
  status?: number
  createTime?: string
}

export const knowledgeApi = {
  uploadDocument(data: { title: string; content?: string; courseId: number; fileName?: string }) {
    return request.post('/knowledge/upload', data)
  },

  getDocuments(params?: { courseId?: number; page?: number; size?: number }) {
    return request.get<{ records: KnowledgeDoc[]; total: number }>('/knowledge/documents', { params })
  },

  deleteDocument(id: number) {
    return request.delete(`/knowledge/documents/${id}`)
  },

  search(params: { keyword: string; page?: number; size?: number }) {
    return request.get<{ records: KnowledgeDoc[]; total: number }>('/knowledge/search', { params })
  },

  vectorize(docId: number) {
    return request.post(`/knowledge/vectorize/${docId}`)
  }
}
