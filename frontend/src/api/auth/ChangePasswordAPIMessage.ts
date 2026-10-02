// 文件说明：前端认证接口封装，用于发起修改密码请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type ChangePasswordPayload = {
  sessionToken: SessionToken
  currentPassword: string
  newPassword: string
}

export function createChangePasswordRequest(
  sessionToken: SessionToken,
  currentPassword: string,
  newPassword: string,
): ApiRequest<ChangePasswordPayload, string> {
  return {
    name: 'ChangePasswordAPIMessage',
    method: 'PATCH',
    path: '/api/v1/profile/password',
    payload: {
      sessionToken,
      currentPassword,
      newPassword,
    },
    parseResponse: parseMessageText,
  }
}
