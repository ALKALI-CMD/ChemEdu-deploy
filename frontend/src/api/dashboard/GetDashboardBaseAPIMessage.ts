// 文件说明：前端看板接口封装，用于发起Get看板基础数据请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { DashboardBaseResponse } from '@/objects/dashboard/apiTypes/DashboardBaseResponse'

export type GetDashboardBasePayload = {
  sessionToken: SessionToken
}

export function createGetDashboardBaseRequest(
  sessionToken: SessionToken,
): ApiRequest<GetDashboardBasePayload, DashboardBaseResponse> {
  return {
    name: 'GetDashboardBaseAPIMessage',
    method: 'POST',
    path: '/api/v1/dashboard/base',
    payload: { sessionToken },
  }
}
