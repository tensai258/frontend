import request from '../request'

export interface ReviewItem {
  id: number
  questionId: number
  content: string
  options?: string
  answer: string
  analysis?: string
  type?: string
  difficulty?: number
  userAnswer?: string
  knowledgeId?: number
  knowledgeName?: string
  ef: number
  intervalDays: number
  repetitions: number
  nextReviewDate: string
  lastQuality?: number
}

export const reviewApi = {
  getDueReviews() {
    return request.get<ReviewItem[]>('/review/due')
  },

  submitReview(data: { reviewId: number; quality: number }) {
    return request.post<string>('/review/submit', data)
  }
}
