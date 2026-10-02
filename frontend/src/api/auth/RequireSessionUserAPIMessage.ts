// 文件说明：前端认证接口封装，用于发起校验会话用户请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type RequireSessionUserPayload = {
  sessionToken: SessionToken
}

export function createRequireSessionUserRequest(
  sessionToken: SessionToken,
): ApiRequest<RequireSessionUserPayload, UserProfile> {
  return {
    name: 'RequireSessionUserAPIMessage',
    method: 'POST',
    path: '/api/RequireSessionUserAPIMessage',
    payload: { sessionToken },
  }
}
