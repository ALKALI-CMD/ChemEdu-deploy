// 文件说明：前端课程讨论接口封装，用于发起更新通知设置请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type UpdateNotificationSettingPayload = {
  sessionToken: SessionToken
  category: string
  enabled: boolean
}

export function createUpdateNotificationSettingRequest(
  sessionToken: SessionToken,
  category: string,
  enabled: boolean,
): ApiRequest<UpdateNotificationSettingPayload, string> {
  return {
    name: 'UpdateNotificationSettingAPIMessage',
    method: 'PATCH',
    path: '/api/v1/notifications/settings',
    payload: {
      sessionToken,
      category,
      enabled,
    },
    parseResponse: parseMessageText,
  }
}
