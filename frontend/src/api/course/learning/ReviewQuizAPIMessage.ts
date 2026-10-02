// 文件说明：前端学习接口封装，用于发起评价/批改测验请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Quiz } from '@/objects/course/learning/Quiz'

export type ReviewQuizPayload = {
  sessionToken: SessionToken
  quizId: string
  subjectiveScore: number
  feedback?: string
}

export function createReviewQuizRequest(
  sessionToken: SessionToken,
  quizId: string,
  subjectiveScore: number,
  feedback?: string,
): ApiRequest<ReviewQuizPayload, Quiz> {
  return {
    name: 'ReviewQuizAPIMessage',
    method: 'POST',
    path: `/api/v1/quizzes/${quizId}/reviews`,
    payload: {
      sessionToken,
      quizId,
      subjectiveScore,
      feedback,
    },
    parseResponse: parseEntityResponse<'quiz', Quiz>('quiz'),
  }
}
