// 文件说明：前端考试评定接口封装，用于学生在争分窗口内提交判分异议。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ArgueMutationResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type CreateArgueTicketPayload = {
  sessionToken: SessionToken
  examId: string
  questionId: string
  reason: string
}

export function createCreateArgueTicketRequest(
  sessionToken: SessionToken,
  examId: string,
  questionId: string,
  reason: string,
): ApiRequest<CreateArgueTicketPayload, ArgueMutationResponse> {
  return {
    name: 'CreateArgueTicketAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/argues',
    payload: { sessionToken, examId, questionId, reason },
  }
}
