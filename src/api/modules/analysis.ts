import request from '../request'
import type { AnalysisData, ClassAnalysisData } from '@/types'

export const analysisApi = {
  getStudentAnalysis(studentId: number) {
    return request.get<AnalysisData>(`/analysis/student/${studentId}`)
  },

  getClassAnalysis(classId: number) {
    return request.get<ClassAnalysisData>(`/analysis/class/${classId}`)
  },

  getKnowledgeMastery(studentId: number, courseId?: number) {
    const params: Record<string, unknown> = { studentId }
    if (courseId) params.courseId = courseId
    return request.get<{ name: string; mastery: number }[]>('/analysis/knowledge/mastery', { params })
  },

  getTrend(studentId: number, courseId?: number, days?: number) {
    const params: Record<string, unknown> = { studentId }
    if (courseId) params.courseId = courseId
    if (days) params.days = days
    return request.get<{ date: string; score: number }[]>('/analysis/trend', { params })
  },

  getWrongQuestions(params?: { courseId?: number; limit?: number }) {
    return request.get<{ question: string; wrongCount: number }[]>('/analysis/wrong-questions', { params })
  }
}
