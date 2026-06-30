export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  className?: string
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
  description: string
  subject: string
  deadline: string
  status: 'pending' | 'submitted' | 'graded' | 'overdue'
  score?: number
  totalScore?: number
  teacherName?: string
  createdAt?: string
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
