import request from '../request'
import type { Assignment } from '@/types'

export interface AssignmentListResult {
  list: Assignment[]
  total: number
  pageSize: number
  pageNum: number
}

export const assignmentApi = {
  getAssignments(params?: { courseId?: number; page?: number; size?: number }) {
    return request.get<AssignmentListResult>('/assignment', { params })
  },

  /** 教师查看自己发布的作业 */
  getMyAssignments(params?: { courseId?: number; page?: number; size?: number }) {
    return request.get<AssignmentListResult>('/assignment/my', { params })
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

  gradeAssignment(id: number, submissionId: number, data: { score?: number; feedback?: string; aiGraded?: number }) {
    return request.post(`/assignment/${id}/grade?submissionId=${submissionId}`, data)
  },

  createAssignment(data: CreateAssignmentData) {
    return request.post('/assignment', data)
  },

  /** 删除作业（教师） */
  deleteAssignment(id: number) {
    return request.delete(`/assignment/${id}`)
  },

  /** 关闭作业（教师） */
  closeAssignment(id: number) {
    return request.put(`/assignment/${id}/close`)
  },

  generatePersonalized(courseId: number) {
    return request.post<Assignment>(`/assignment/personalized?courseId=${courseId}`)
  },

  getSubjects() {
    return Promise.resolve(['数据结构', '高等数学', '计算机组成原理', '操作系统', '计算机网络'])
  }
}

export interface SubmitData {
  answers?: string
  timeSpent?: number
}

export interface CreateAssignmentData {
  title: string
  description?: string
  courseId: number
  /** 手动指定的题目ID列表（逗号分隔） */
  questionIds?: string
  /** 按分类自动抽题（与questionIds二选一） */
  category?: string
  /** 自动抽题数量 */
  questionCount?: number
  endTime?: string
  totalScore?: number
  timeLimit?: number
  allowRetry?: number
}
