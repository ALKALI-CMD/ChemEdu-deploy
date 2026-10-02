// 文件说明：前端学习接口封装，用于发起解析课时进度请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'

export type LessonProgressMap = Record<string, boolean>

export type ResolveLessonProgressPayload = {
  currentUser: UserProfile
}

export function createResolveLessonProgressRequest(
  currentUser: UserProfile,
): ApiRequest<ResolveLessonProgressPayload, LessonProgressMap> {
  return {
    name: 'ResolveLessonProgressAPIMessage',
    method: 'POST',
    path: '/api/ResolveLessonProgressAPIMessage',
    payload: { currentUser },
  }
}
