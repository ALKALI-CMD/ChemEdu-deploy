// 文件说明：前端认证接口封装，用于发起退出登录请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type LogoutPayload = {
  sessionToken: SessionToken
}

export function createLogoutRequest(sessionToken: SessionToken): ApiRequest<LogoutPayload, void> {
  return {
    name: 'LogoutAPIMessage',
    method: 'DELETE',
    path: '/api/v1/sessions',
    payload: { sessionToken },
  }
}
