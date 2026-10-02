// 文件说明：前端课程讨论接口封装，用于发起标记通知Read请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type MarkNotificationReadPayload = {
  sessionToken: SessionToken
  notificationId: string | undefined
  read: boolean
}

export function createMarkNotificationReadRequest(
  sessionToken: SessionToken,
  notificationId: string | undefined,
  read: boolean,
): ApiRequest<MarkNotificationReadPayload, string> {
  return {
    name: 'MarkNotificationReadAPIMessage',
    method: 'PATCH',
    path: '/api/v1/notifications/read',
    payload: {
      sessionToken,
      notificationId,
      read,
    },
    parseResponse: parseMessageText,
  }
}
