// 文件说明：前端学习接口封装，用于发起提交测验请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { QuizAnswerRecord } from '@/objects/course/learning/QuizAnswerRecord'
import type { QuizOption } from '@/objects/course/learning/QuizOption'

export type SubmitQuizPayload = {
  sessionToken: SessionToken
  quizId: string
  objectiveAnswers: QuizOption[]
  subjectiveAnswer?: string
  fillBlankAnswers: string[]
  answerRecords: QuizAnswerRecord[]
}

export function createSubmitQuizRequest(
  sessionToken: SessionToken,
  quizId: string,
  objectiveAnswers: QuizOption[],
  subjectiveAnswer?: string,
  fillBlankAnswers: string[] = [],
  answerRecords: QuizAnswerRecord[] = [],
): ApiRequest<SubmitQuizPayload, Quiz> {
  return {
    name: 'SubmitQuizAPIMessage',
    method: 'POST',
    path: `/api/v1/quizzes/${quizId}/submissions`,
    payload: {
      sessionToken,
      quizId,
      objectiveAnswers,
      subjectiveAnswer,
      fillBlankAnswers,
      answerRecords,
    },
    parseResponse: parseEntityResponse<'quiz', Quiz>('quiz'),
  }
}
