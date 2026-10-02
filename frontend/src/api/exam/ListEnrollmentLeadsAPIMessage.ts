// 文件说明：前端考试评定接口封装，用于校长与教研老师查看报名咨询线索列表。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { EnrollmentLeadListResponse } from '@/objects/exam/apiTypes/InsightApiResponses'

export type ListEnrollmentLeadsPayload = {
  sessionToken: SessionToken
}

export function createListEnrollmentLeadsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListEnrollmentLeadsPayload, EnrollmentLeadListResponse> {
  return {
    name: 'ListEnrollmentLeadsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/leads/list',
    payload: { sessionToken },
  }
}
