// 文件说明：前端考试评定接口封装，用于考试窗口状态流转（发布、开阅、公布成绩）。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ExamMutationResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type SetExamStatusPayload = {
  sessionToken: SessionToken
  examId: string
  status: string
}

export function createSetExamStatusRequest(
  sessionToken: SessionToken,
  examId: string,
  status: string,
): ApiRequest<SetExamStatusPayload, ExamMutationResponse> {
  return {
    name: 'SetExamStatusAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/status',
    payload: { sessionToken, examId, status },
  }
}
