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

export interface KnowledgeNode {
  id: number
  name: string
  category: string
  level: number
  masteryRate?: number
  masteryLevel: string
  isWeak: boolean
  importance?: number
}

export interface KnowledgeEdge {
  sourceId: number
  targetId: number
  relationType: string
  description?: string
  weight?: number
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface KnowledgeDiagnosis {
  knowledgeId: number
  knowledgeName: string
  category: string
  masteryRate: number
  level: string
  totalQuestions: number
  wrongQuestions: number
  correctQuestions: number
  wrongFrequency: number
  rootCauseIds: number[]
  rootCauseNames: string[]
  rootCauseDescription: string
  learningAdvice: string
  practiceQuestionIds: number[]
  recommendedCount: number
}

export interface RecommendData {
  weakCategories?: Array<{
    category: string
    wrongCount: number
    masteredCount: number
    totalCount: number
    weaknessLevel: string
    practiceQuestions?: any[]
  }>
  knowledgeWeaknesses?: Array<{
    knowledgeId: number
    knowledgeName: string
    category: string
    totalQuestions: number
    wrongCount: number
    masteryRate: number
    weaknessLevel: string
    rootCauseIds?: number[]
    rootCauseNames?: string[]
    practiceQuestions?: any[]
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
  diagnosisSummary?: string
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
  },

  getKnowledgeGraph(courseId: number) {
    return request.get<KnowledgeGraphData>(`/knowledge-graph/graph/${courseId}`)
  },

  diagnoseWeakPoints(courseId?: number) {
    return request.get<KnowledgeDiagnosis[]>('/knowledge-graph/diagnose', {
      params: { courseId: courseId || 1 }
    })
  },

  traceRootCause(knowledgeId: number) {
    return request.get<number[]>(`/knowledge-graph/trace/${knowledgeId}`)
  },

  getLearningPath(knowledgeId: number) {
    return request.get<number[]>(`/knowledge-graph/learning-path/${knowledgeId}`)
  },

  aiGenerate(data: { knowledgeIds?: number[]; count?: number; courseId?: number }) {
    return request.post<AiQuestionData[]>('/question/ai-generate', data)
  }
}

export interface AiQuestionData {
  id: number
  content: string
  options: string[]
  answer: string
  analysis: string
  difficulty: number
  knowledgeName: string
  sessionId: string
  isAiGenerated: boolean
}
