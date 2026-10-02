// 文件说明：前端课程目录接口封装，用于发起更新课程状态请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'

export type UpdateCourseStatusPayload = {
  sessionToken: SessionToken
  status: CourseStatus
}

export function createUpdateCourseStatusRequest(
  sessionToken: SessionToken,
  courseId: string,
  status: CourseStatus,
): ApiRequest<UpdateCourseStatusPayload, Course> {
  return {
    name: 'UpdateCourseStatusAPIMessage',
    method: 'PATCH',
    path: `/api/v1/courses/${courseId}/status`,
    payload: {
      sessionToken,
      status,
    },
    parseResponse: parseEntityResponse<'course', Course>('course'),
  }
}
