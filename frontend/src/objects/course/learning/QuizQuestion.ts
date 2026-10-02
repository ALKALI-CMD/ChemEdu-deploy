// 文件说明：定义学习测验题目领域数据类型，用于业务流程和接口传输。
import type { QuizQuestionOption } from '@/objects/course/learning/QuizQuestionOption'
import type { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'

export type QuizQuestion = {
  id: string
  questionType: QuizQuestionType
  prompt: string
  options: QuizQuestionOption[]
  correctAnswers: string[]
  explanation?: string
  points: number
}
