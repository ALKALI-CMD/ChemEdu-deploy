// 文件说明：定义学习发布测验领域数据类型，用于业务流程和接口传输。
import type { QuizOption } from '@/objects/course/learning/QuizOption'
import type { QuizQuestion } from '@/objects/course/learning/QuizQuestion'

export type PublishQuizInput = {
  courseId: string
  title: string
  durationMinutes: number
  objectiveQuestionCount: number
  subjectiveQuestionCount: number
  drawCount?: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  answerKeys: QuizOption[]
  questionBank: QuizQuestion[]
}
