// 文件说明：前端课程评价接口封装，用于发起提交课程评价/批改请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseEntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'

export type SubmitCourseReviewPayload = {
  sessionToken: SessionToken
  rating: number
  content: string
}

export function createSubmitCourseReviewRequest(
  sessionToken: SessionToken,
  courseId: string,
  rating: number,
  content: string,
): ApiRequest<SubmitCourseReviewPayload, CourseReview> {
  return {
    name: 'SubmitCourseReviewAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${courseId}/reviews`,
    payload: {
      sessionToken,
      rating,
      content,
    },
    parseResponse: parseEntityResponse<'review', CourseReview>('review'),
  }
}
