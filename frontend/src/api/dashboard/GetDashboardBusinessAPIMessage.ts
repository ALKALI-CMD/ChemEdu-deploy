// 文件说明：前端看板接口封装，用于发起Get看板经营请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DashboardBusinessResponse } from '@/objects/dashboard/apiTypes/DashboardBusinessResponse'

export type GetDashboardBusinessPayload = {
  sessionToken: SessionToken
}

export function createGetDashboardBusinessRequest(
  sessionToken: SessionToken,
): ApiRequest<GetDashboardBusinessPayload, DashboardBusinessResponse> {
  return {
    name: 'GetDashboardBusinessAPIMessage',
    method: 'POST',
    path: '/api/v1/dashboard/business',
    payload: { sessionToken },
  }
}
