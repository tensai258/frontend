export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone?: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  status?: number
  classId?: string
  className?: string
  grade?: string
  createTime?: string
  createdAt?: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  email: string
  role: string
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  isStreaming?: boolean
}

export interface Assignment {
  id: number
  title: string
  description?: string
  courseId?: number
  courseName?: string
  subject?: string
  teacherId?: number
  teacherName?: string
  status?: string
  startTime?: string
  endTime?: string
  deadline?: string
  totalScore?: number
  timeLimit?: number
  allowRetry?: number
  score?: number
  createdAt?: string
  createTime?: string
  /** 作业中的题目列表（详情接口返回） */
  questions?: QuestionBrief[]
  /** 提交人数（教师端） */
  submissionCount?: number
}

/** 作业中的题目简要信息 */
export interface QuestionBrief {
  id: number
  content: string
  options?: string
  answer?: string
  analysis?: string
  type?: string
  difficulty?: number
  score?: number
  tags?: string
  knowledgeId?: number
  category?: string
}

export interface AssignmentSubmission {
  assignmentId: number
  content: string
  attachments?: string[]
}

export interface AnalysisData {
  radarData: {
    indicator: { name: string; max: number }[]
    value: number[]
    average: number[]
  }
  trendData: {
    dates: string[]
    scores: number[]
    classAverage: number[]
  }
  heatmapData: {
    subjects: string[]
    days: string[]
    data: [number, number, number][]
  }
  overview: {
    totalScore: number
    rank: number
    classSize: number
    completionRate: number
    avgScore: number
  }
}

export interface ClassAnalysisData {
  className: string
  avgScore: number
  passRate: number
  excellentRate: number
  scoreDistribution: { range: string; count: number }[]
  subjectComparison: { subject: string; avg: number }[]
}

export interface KnowledgeNode {
  id: number
  name: string
  subject: string
  level: number
  mastery: number
  children?: KnowledgeNode[]
  parentId?: number
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
