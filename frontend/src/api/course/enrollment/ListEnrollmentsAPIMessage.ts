// 文件说明：前端课程报名接口封装，用于发起列表查询Enrollments请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { CourseEnrollment } from '@/objects/course/enrollment/CourseEnrollment'

export type ListEnrollmentsPayload = {
  sessionToken: SessionToken
}

export function createListEnrollmentsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListEnrollmentsPayload, CourseEnrollment[]> {
  return {
    name: 'ListEnrollmentsAPIMessage',
    method: 'POST',
    path: '/api/ListEnrollmentsAPIMessage',
    payload: { sessionToken },
  }
}
