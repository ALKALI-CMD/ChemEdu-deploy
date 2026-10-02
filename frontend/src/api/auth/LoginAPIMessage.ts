// 文件说明：前端认证接口封装，用于发起登录请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  ok?: boolean
  sessionToken?: SessionToken | null
  user?: AuthSessionResponse['user'] | null
  expiresAt?: AuthSessionResponse['expiresAt'] | null
  message?: string | null
}

function parseLoginResponse(response: unknown): AuthSessionResponse {
  const value = response as LoginResponse

  if (value.sessionToken && value.user && value.expiresAt) {
    return {
      sessionToken: value.sessionToken,
      user: value.user,
      expiresAt: value.expiresAt,
    }
  }

  throw new Error(value.message || '登录响应格式错误，请重试。')
}

export function createLoginRequest(payload: LoginPayload): ApiRequest<LoginPayload, AuthSessionResponse> {
  return {
    name: 'LoginAPIMessage',
    method: 'POST',
    path: '/api/v1/sessions',
    payload,
    parseResponse: parseLoginResponse,
  }
}
