// 文件说明：前端课程评价接口封装，用于发起列表查询课程Reviews请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'

export type ListCourseReviewsPayload = {
  sessionToken: SessionToken
}

export function createListCourseReviewsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListCourseReviewsPayload, CourseReview[]> {
  return {
    name: 'ListCourseReviewsAPIMessage',
    method: 'POST',
    path: '/api/ListCourseReviewsAPIMessage',
    payload: { sessionToken },
  }
}
