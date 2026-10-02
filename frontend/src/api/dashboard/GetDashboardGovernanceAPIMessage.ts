// 文件说明：前端看板接口封装，用于发起Get看板治理请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DashboardGovernanceResponse } from '@/objects/dashboard/apiTypes/DashboardGovernanceResponse'

export type GetDashboardGovernancePayload = {
  sessionToken: SessionToken
}

export function createGetDashboardGovernanceRequest(
  sessionToken: SessionToken,
): ApiRequest<GetDashboardGovernancePayload, DashboardGovernanceResponse> {
  return {
    name: 'GetDashboardGovernanceAPIMessage',
    method: 'POST',
    path: '/api/v1/dashboard/governance',
    payload: { sessionToken },
  }
}
