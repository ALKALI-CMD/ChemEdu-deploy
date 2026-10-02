// 文件说明：前端管理端接口封装，用于发起审核课程请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'

export type AuditCoursePayload = {
  sessionToken: SessionToken
  courseId: string
  auditStatus: CourseAuditStatus
  auditComment: string
}

export function createAuditCourseRequest(
  sessionToken: SessionToken,
  courseId: string,
  auditStatus: CourseAuditStatus,
  auditComment: string,
): ApiRequest<AuditCoursePayload, Course> {
  return {
    name: 'AuditCourseAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${courseId}/audits`,
    payload: {
      sessionToken,
      courseId,
      auditStatus,
      auditComment,
    },
    parseResponse: parseEntityResponse<'course', Course>('course'),
  }
}
