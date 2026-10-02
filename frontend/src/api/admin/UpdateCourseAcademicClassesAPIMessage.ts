// 文件说明：前端管理端接口封装，用于发起更新课程教学Classes请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Course } from '@/objects/course/catalog/Course'

export type UpdateCourseAcademicClassesPayload = {
  sessionToken: SessionToken
  courseId: string
  academicClassIds: string[]
}

export function createUpdateCourseAcademicClassesRequest(
  sessionToken: SessionToken,
  courseId: string,
  academicClassIds: string[],
): ApiRequest<UpdateCourseAcademicClassesPayload, Course> {
  return {
    name: 'UpdateCourseAcademicClassesAPIMessage',
    method: 'PATCH',
    path: `/api/v1/admin/courses/${courseId}/academic-classes`,
    payload: {
      sessionToken,
      courseId,
      academicClassIds,
    },
    parseResponse: parseEntityResponse<'course', Course>('course'),
  }
}
