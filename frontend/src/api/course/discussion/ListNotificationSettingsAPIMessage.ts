// 文件说明：前端课程讨论接口封装，用于发起列表查询通知Settings请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { NotificationSetting } from '@/objects/course/discussion/NotificationSetting'

export type ListNotificationSettingsPayload = {
  sessionToken: SessionToken
}

export function createListNotificationSettingsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListNotificationSettingsPayload, NotificationSetting[]> {
  return {
    name: 'ListNotificationSettingsAPIMessage',
    method: 'POST',
    path: '/api/ListNotificationSettingsAPIMessage',
    payload: { sessionToken },
  }
}
