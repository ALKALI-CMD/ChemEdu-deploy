// 文件说明：前端学习接口封装，用于发起发布测验请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { QuizOption } from '@/objects/course/learning/QuizOption'
import type { QuizQuestion } from '@/objects/course/learning/QuizQuestion'

export type PublishQuizPayload = {
  courseId: string
  title: string
  durationMinutes: number
  objectiveQuestionCount: number
  subjectiveQuestionCount: number
  drawCount?: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  answerKeys: QuizOption[]
  questionBank?: QuizQuestion[]
}

export type PublishQuizRequestPayload = PublishQuizPayload & {
  sessionToken: SessionToken
}

export function createPublishQuizRequest(
  sessionToken: SessionToken,
  input: PublishQuizPayload,
): ApiRequest<PublishQuizRequestPayload, Quiz> {
  return {
    name: 'PublishQuizAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${input.courseId}/quizzes`,
    payload: { sessionToken, ...input },
    parseResponse: parseEntityResponse<'quiz', Quiz>('quiz'),
  }
}
