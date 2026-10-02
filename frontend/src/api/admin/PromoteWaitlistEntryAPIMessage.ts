// 文件说明：前端管理端接口封装，用于发起转正候补名单Entry请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserId } from '@/objects/auth/UserId'

export type PromoteWaitlistEntryPayload = {
  sessionToken: SessionToken
  courseId: string
  userId: UserId
}

export function createPromoteWaitlistEntryRequest(
  sessionToken: SessionToken,
  courseId: string,
  userId: UserId,
): ApiRequest<PromoteWaitlistEntryPayload, string> {
  return {
    name: 'PromoteWaitlistEntryAPIMessage',
    method: 'POST',
    path: `/api/v1/admin/courses/${courseId}/waitlist/${userId}/promote`,
    payload: {
      sessionToken,
      courseId,
      userId,
    },
    parseResponse: parseMessageText,
  }
}
