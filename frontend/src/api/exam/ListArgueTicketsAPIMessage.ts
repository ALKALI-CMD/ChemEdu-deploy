// 文件说明：前端考试评定接口封装，用于阅卷人员拉取争分工单列表。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ArgueListResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type ListArgueTicketsPayload = {
  sessionToken: SessionToken
  examId: string | null
}

export function createListArgueTicketsRequest(
  sessionToken: SessionToken,
  examId: string | null = null,
): ApiRequest<ListArgueTicketsPayload, ArgueListResponse> {
  return {
    name: 'ListArgueTicketsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/argues/list',
    payload: { sessionToken, examId },
  }
}
