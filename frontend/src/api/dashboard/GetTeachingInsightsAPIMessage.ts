// 文件说明：前端看板接口封装，用于发起Get教学Insights请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'

export type GetTeachingInsightsPayload = {
  sessionToken: SessionToken
}

export function createGetTeachingInsightsRequest(
  sessionToken: SessionToken,
): ApiRequest<GetTeachingInsightsPayload, TeachingInsightSnapshot> {
  return {
    name: 'GetTeachingInsightsAPIMessage',
    method: 'POST',
    path: '/api/v1/dashboard/teaching-insights',
    payload: { sessionToken },
  }
}
