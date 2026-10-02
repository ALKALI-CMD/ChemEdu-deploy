// 文件说明：前端认证接口封装，用于发起注册请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { AuthSessionResponse } from '@/objects/auth/apiTypes/AuthResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserRole } from '@/objects/auth/UserRole'

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role: UserRole
  age?: number
  grade?: string
  subject?: string
  bio: string
}

type RegisterResponse = {
  ok?: boolean
  sessionToken?: SessionToken | null
  user?: AuthSessionResponse['user'] | null
  expiresAt?: AuthSessionResponse['expiresAt'] | null
  message?: string | null
}

function parseRegisterResponse(response: unknown): AuthSessionResponse {
  const value = response as RegisterResponse

  if (value.sessionToken && value.user && value.expiresAt) {
    return {
      sessionToken: value.sessionToken,
      user: value.user,
      expiresAt: value.expiresAt,
    }
  }

  throw new Error(value.message || '注册响应格式错误，请重试。')
}

export function createRegisterRequest(payload: RegisterPayload): ApiRequest<RegisterPayload, AuthSessionResponse> {
  return {
    name: 'RegisterAPIMessage',
    method: 'POST',
    path: '/api/v1/users',
    payload,
    parseResponse: parseRegisterResponse,
  }
}
