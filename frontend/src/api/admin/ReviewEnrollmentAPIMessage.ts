// 文件说明：前端管理端接口封装，用于发起评价/批改报名请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { UserId } from '@/objects/auth/UserId'

export type ReviewEnrollmentPayload = {
  sessionToken: SessionToken
  courseId: string
  userId: UserId
  approved: boolean
}

export function createReviewEnrollmentRequest(
  sessionToken: SessionToken,
  courseId: string,
  userId: UserId,
  approved: boolean,
): ApiRequest<ReviewEnrollmentPayload, string> {
  return {
    name: 'ReviewEnrollmentAPIMessage',
    method: 'POST',
    path: `/api/v1/admin/courses/${courseId}/enrollments/${userId}/review`,
    payload: {
      sessionToken,
      courseId,
      userId,
      approved,
    },
    parseResponse: parseMessageText,
  }
}
