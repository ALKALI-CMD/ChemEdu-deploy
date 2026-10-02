// 文件说明：定义学习提交测验领域数据类型，用于业务流程和接口传输。
import type { QuizAnswerRecord } from '@/objects/course/learning/QuizAnswerRecord'
import type { QuizOption } from '@/objects/course/learning/QuizOption'

export type SubmitQuizInput = {
  quizId: string
  objectiveAnswers: QuizOption[]
  subjectiveAnswer?: string
  fillBlankAnswers: string[]
  answerRecords: QuizAnswerRecord[]
}
