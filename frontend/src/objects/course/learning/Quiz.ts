// 文件说明：定义学习测验领域数据类型，用于业务流程和接口传输。
import type { QuizAnswerRecord } from '@/objects/course/learning/QuizAnswerRecord'
import type { QuizQuestion } from '@/objects/course/learning/QuizQuestion'
import type { QuizStatus } from '@/objects/course/learning/QuizStatus'

export type Quiz = {
  id: string
  courseId: string
  title: string
  durationMinutes: number
  objectiveQuestionCount: number
  subjectiveQuestionCount: number
  drawCount?: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  status: QuizStatus
  score?: number
  objectiveScore?: number
  subjectiveScore?: number
  subjectiveAnswer?: string
  subjectiveFeedback?: string
  reviewerName?: string
  reviewedAt?: string
  submittedAt?: string
  questionBank: QuizQuestion[]
  objectiveAnswerRecord: QuizAnswerRecord[]
  wrongQuestionIds: string[]
}
