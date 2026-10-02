// 文件说明：前端考试评定接口封装，用于阅卷人员拉取某场考试的全部答题卡。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { AnswerSheetListResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type ListAnswerSheetsPayload = {
  sessionToken: SessionToken
  examId: string
}

export function createListAnswerSheetsRequest(
  sessionToken: SessionToken,
  examId: string,
): ApiRequest<ListAnswerSheetsPayload, AnswerSheetListResponse> {
  return {
    name: 'ListAnswerSheetsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/sheets/list',
    payload: { sessionToken, examId },
  }
}
