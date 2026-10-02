// 文件说明：前端课程报名接口封装，用于发起报名课程请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { EnrollmentMessageResponse } from '@/objects/course/enrollment/apiTypes/EnrollmentMessageResponse'
import type { PaymentMethod } from '@/lib/paymentMethods'

export type EnrollCoursePayload = {
  sessionToken: SessionToken
  inviteCode?: string
  paymentMethod?: PaymentMethod
}

export function createEnrollCourseRequest(
  sessionToken: SessionToken,
  courseId: string,
  inviteCode?: string,
  paymentMethod?: PaymentMethod,
): ApiRequest<EnrollCoursePayload, EnrollmentMessageResponse> {
  return {
    name: 'EnrollCourseAPIMessage',
    method: 'POST',
    path: `/api/v1/courses/${courseId}/enrollments`,
    payload: {
      sessionToken,
      inviteCode,
      paymentMethod,
    },
  }
}
