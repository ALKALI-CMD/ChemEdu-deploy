// 文件说明：前端课程目录接口封装，用于发起新增或更新课程请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'

export type UpsertCoursePayload = CourseEditorInput & {
  sessionToken: SessionToken
}

export function createUpsertCourseRequest(
  sessionToken: SessionToken,
  input: CourseEditorInput,
): ApiRequest<UpsertCoursePayload, Course> {
  return {
    name: 'UpsertCourseAPIMessage',
    method: input.courseId ? 'PUT' : 'POST',
    path: input.courseId ? `/api/v1/courses/${input.courseId}` : '/api/v1/courses',
    payload: {
      sessionToken,
      ...input,
    },
    parseResponse: parseEntityResponse<'course', Course>('course'),
  }
}
