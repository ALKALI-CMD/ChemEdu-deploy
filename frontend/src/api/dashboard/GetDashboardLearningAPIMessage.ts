// 文件说明：前端看板接口封装，用于发起Get看板学习请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DashboardLearningResponse } from '@/objects/dashboard/apiTypes/DashboardLearningResponse'

export type GetDashboardLearningPayload = {
  sessionToken: SessionToken
}

export function createGetDashboardLearningRequest(
  sessionToken: SessionToken,
): ApiRequest<GetDashboardLearningPayload, DashboardLearningResponse> {
  return {
    name: 'GetDashboardLearningAPIMessage',
    method: 'POST',
    path: '/api/v1/dashboard/learning',
    payload: { sessionToken },
  }
}
