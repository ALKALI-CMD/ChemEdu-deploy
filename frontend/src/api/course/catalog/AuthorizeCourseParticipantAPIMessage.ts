// 文件说明：前端课程目录接口封装，用于发起授权课程Participant请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type AuthorizeCourseParticipantPayload = {
  user: UserProfile
  courseId: string
}

export function createAuthorizeCourseParticipantRequest(
  user: UserProfile,
  courseId: string,
): ApiRequest<AuthorizeCourseParticipantPayload, string> {
  return {
    name: 'AuthorizeCourseParticipantAPIMessage',
    method: 'POST',
    path: '/api/AuthorizeCourseParticipantAPIMessage',
    payload: { user, courseId },
    parseResponse: parseMessageText,
  }
}
