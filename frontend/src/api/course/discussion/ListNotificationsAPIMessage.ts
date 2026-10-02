// 文件说明：前端课程讨论接口封装，用于发起列表查询Notifications请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { NotificationItem } from '@/objects/course/discussion/NotificationItem'

export type ListNotificationsPayload = {
  sessionToken: SessionToken
}

export function createListNotificationsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListNotificationsPayload, NotificationItem[]> {
  return {
    name: 'ListNotificationsAPIMessage',
    method: 'POST',
    path: '/api/ListNotificationsAPIMessage',
    payload: { sessionToken },
  }
}
