// 文件说明：前端考试评定接口封装，用于教研老师复核争分工单（维持原判/调整得分/驳回）。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ArgueMutationResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type ResolveArgueTicketPayload = {
  sessionToken: SessionToken
  ticketId: string
  action: 'adjust' | 'uphold' | 'reject'
  response: string
  adjustedScore: number | null
  adjustedComment: string | null
}

export function createResolveArgueTicketRequest(
  payload: ResolveArgueTicketPayload,
): ApiRequest<ResolveArgueTicketPayload, ArgueMutationResponse> {
  return {
    name: 'ResolveArgueTicketAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/argues/resolve',
    payload,
  }
}
