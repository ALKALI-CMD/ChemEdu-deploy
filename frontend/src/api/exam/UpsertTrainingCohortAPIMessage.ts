// 文件说明：前端考试评定接口封装，用于创建或更新培训期次并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { TrainingCohortMutationResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type UpsertTrainingCohortPayload = {
  sessionToken: SessionToken
  id: string | null
  name: string
  season: string
  startDate: string
  endDate: string
  description: string
  memberIds: string[]
  status: string | null
}

export function createUpsertTrainingCohortRequest(
  payload: UpsertTrainingCohortPayload,
): ApiRequest<UpsertTrainingCohortPayload, TrainingCohortMutationResponse> {
  return {
    name: 'UpsertTrainingCohortAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/cohorts',
    payload,
  }
}
