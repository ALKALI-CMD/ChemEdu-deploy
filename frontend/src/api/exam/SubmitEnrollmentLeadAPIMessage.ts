// 文件说明：前端考试评定接口封装，用于官网公开表单提交报名咨询线索（无需登录）。
import type { ApiRequest } from '@/lib/apiClient'
import type { EnrollmentLeadMutationResponse } from '@/objects/exam/apiTypes/InsightApiResponses'

export type SubmitEnrollmentLeadPayload = {
  studentName: string
  contact: string
  gradeLevel: string
  targetStage: string
  courseInterest: string
  message: string
}

export function createSubmitEnrollmentLeadRequest(
  payload: SubmitEnrollmentLeadPayload,
): ApiRequest<SubmitEnrollmentLeadPayload, EnrollmentLeadMutationResponse> {
  return {
    name: 'SubmitEnrollmentLeadAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/leads',
    payload,
  }
}
