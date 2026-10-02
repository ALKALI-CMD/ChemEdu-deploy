// 文件说明：前端考试评定接口封装，用于教研老师创建或编辑考试试卷。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ExamQuestion } from '@/objects/exam/ExamQuestion'
import type { ExamMutationResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type UpsertExamPayload = {
  sessionToken: SessionToken
  id: string | null
  cohortId: string
  name: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  argueHours: number | null
  questions: ExamQuestion[]
}

export function createUpsertExamRequest(
  payload: UpsertExamPayload,
): ApiRequest<UpsertExamPayload, ExamMutationResponse> {
  return {
    name: 'UpsertExamAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/create',
    payload,
  }
}
