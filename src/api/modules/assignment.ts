import request from '../request'
import type { Assignment, AssignmentSubmission } from '@/types'

export interface AssignmentListResult {
  records: Assignment[]
  total: number
  size: number
  current: number
}

export const assignmentApi = {
  getAssignments(params?: { courseId?: number; page?: number; size?: number }) {
    return request.get<AssignmentListResult>('/assignment', { params })
  },

  getAssignmentDetail(id: number) {
    return request.get<Assignment>(`/assignment/${id}`)
  },

  submitAssignment(id: number, data: SubmitData) {
    return request.post(`/assignment/${id}/submit`, data)
  },

  getSubmissions(id: number) {
    return request.get(`/assignment/${id}/submissions`)
  },

  gradeAssignment(id: number, submissionId: number, data: { score?: number; comment?: string }) {
    return request.post(`/assignment/${id}/grade?submissionId=${submissionId}`, data)
  },

  createAssignment(data: CreateAssignmentData) {
    return request.post('/assignment', data)
  },

  generatePersonalized(courseId: number) {
    return request.post<Assignment>(`/assignment/personalized?courseId=${courseId}`)
  },

  getSubjects() {
    // 从课程列表中获取学科，这里返回模拟数据
    return Promise.resolve(['数据结构', '高等数学', '计算机组成原理', '操作系统', '计算机网络'])
  }
}

export interface SubmitData {
  answers?: Record<string, string>
  content?: string
  attachments?: string[]
}

export interface CreateAssignmentData {
  title: string
  description?: string
  courseId: number
  questionIds?: number[]
  totalScore?: number
  deadline?: string
}
