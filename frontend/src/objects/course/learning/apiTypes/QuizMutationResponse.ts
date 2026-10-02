// 文件说明：定义学习测验变更接口响应类型，用于前后端 API 返回值约束。
import type { Quiz } from '@/objects/course/learning/Quiz'

export type QuizMutationResponse = {
  message: string
  quiz: Quiz
}
