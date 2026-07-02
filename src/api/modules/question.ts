import request from '../request'

export interface QuestionItem {
  id: number
  content: string
  options?: any
  answer: string
  analysis?: string
  type: string
  courseId?: number
  knowledgeId?: number
  difficulty?: number
  score?: number
  tags?: string
}

export interface WrongQuestionItem {
  id: number
  questionId?: number
  content?: string
  options?: string
  answer?: string
  analysis?: string
  userAnswer: string
  type?: string
  difficulty?: number
  category?: string
  wrongCount: number
  mastered: number
  knowledgeId?: number
  tags?: string
  createTime?: string
}

export interface RecommendData {
  weakCategories?: Array<{
    category: string
    wrongCount: number
    masteredCount: number
    totalCount: number
    weaknessLevel: string
  }>
  recommendedQuestions?: Array<{
    id: number
    content: string
    options: string
    answer: string
    analysis: string
    type: string
    difficulty: number
    category: string
    knowledgeId: number
    tags: string
    score: number
  }>
  suggestion?: string
}

export const questionApi = {
  getList(params?: { page?: number; size?: number; category?: string; knowledgeId?: number }) {
    return request.get<{ list: QuestionItem[]; total: number }>('/question/list', { params })
  },

  getDetail(id: number) {
    return request.get<QuestionItem>(`/question/${id}`)
  },

  getCategories() {
    return request.get<string[]>('/question/categories')
  },

  submitAnswer(data: { questionId: number; userAnswer: string }) {
    return request.post<{ correct: boolean; message: string; correctAnswer?: string; analysis?: string }>('/question/submit', data)
  },

  getWrongList(params?: { page?: number; size?: number; category?: string }) {
    return request.get<{ list: WrongQuestionItem[]; total: number }>('/question/wrong/list', { params })
  },

  markWrongMastered(id: number) {
    return request.put(`/question/wrong/${id}/master`)
  },

  deleteWrong(id: number) {
    return request.delete(`/question/wrong/${id}`)
  },

  getRecommend() {
    return request.get<RecommendData>('/question/recommend')
  }
}
