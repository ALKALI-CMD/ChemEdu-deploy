// 文件说明：前端考试评定接口封装，用于按角色拉取考试列表。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ExamListResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type ListExamsPayload = {
  sessionToken: SessionToken
  cohortId: string | null
}

export function createListExamsRequest(
  sessionToken: SessionToken,
  cohortId: string | null = null,
): ApiRequest<ListExamsPayload, ExamListResponse> {
  return {
    name: 'ListExamsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/list',
    payload: { sessionToken, cohortId },
  }
}
