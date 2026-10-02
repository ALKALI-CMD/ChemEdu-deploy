// 文件说明：前端考试评定接口封装，用于助教老师上传学生答题卡。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { AnswerSheetMutationResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type UploadAnswerSheetPayload = {
  sessionToken: SessionToken
  examId: string
  studentId: string
  imageDataUrl: string
}

export function createUploadAnswerSheetRequest(
  payload: UploadAnswerSheetPayload,
): ApiRequest<UploadAnswerSheetPayload, AnswerSheetMutationResponse> {
  return {
    name: 'UploadAnswerSheetAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/sheets',
    payload,
  }
}
