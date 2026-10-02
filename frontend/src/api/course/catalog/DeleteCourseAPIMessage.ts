// 文件说明：前端课程目录接口封装，用于发起删除课程请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'

export type CourseTokenPayload = {
  sessionToken: SessionToken
}

export function createDeleteCourseRequest(
  sessionToken: SessionToken,
  courseId: string,
): ApiRequest<CourseTokenPayload, string> {
  return {
    name: 'DeleteCourseAPIMessage',
    method: 'DELETE',
    path: `/api/v1/courses/${courseId}`,
    payload: { sessionToken },
    parseResponse: parseMessageText,
  }
}
