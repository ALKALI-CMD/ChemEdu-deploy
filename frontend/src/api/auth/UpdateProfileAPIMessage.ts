// 文件说明：前端认证接口封装，用于发起更新Profile请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type UpdateProfilePayload = {
  name: string
  age?: number
  grade?: string
  subject?: string
  bio: string
  avatarUrl?: string
}

export type UpdateProfileRequestPayload = UpdateProfilePayload & {
  sessionToken: SessionToken
}

function parseUserProfileResponse(response: unknown): UserProfile {
  const maybeWrapped = response as { user?: UserProfile }
  if (maybeWrapped.user) {
    return maybeWrapped.user
  }
  return response as UserProfile
}

export function createUpdateProfileRequest(
  sessionToken: SessionToken,
  input: UpdateProfilePayload,
): ApiRequest<UpdateProfileRequestPayload, UserProfile> {
  return {
    name: 'UpdateProfileAPIMessage',
    method: 'PUT',
    path: '/api/v1/profile',
    payload: {
      sessionToken,
      ...input,
    },
    parseResponse: parseUserProfileResponse,
  }
}
