// 文件说明：前端管理端接口封装，用于发起更新用户访问权限请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type UpdateUserAccessPayload = {
  sessionToken: SessionToken
  userId: UserId
  role: UserRole
  permissions: string[]
}

export function createUpdateUserAccessRequest(
  sessionToken: SessionToken,
  userId: UserId,
  role: UserRole,
  permissions: string[],
): ApiRequest<UpdateUserAccessPayload, UserProfile> {
  return {
    name: 'UpdateUserAccessAPIMessage',
    method: 'PATCH',
    path: `/api/v1/users/${userId}/access`,
    payload: {
      sessionToken,
      userId,
      role,
      permissions,
    },
    parseResponse: parseEntityResponse<'user', UserProfile>('user'),
  }
}
