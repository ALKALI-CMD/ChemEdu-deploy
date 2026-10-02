// 文件说明：前端考试评定接口封装，用于按角色拉取可见的培训期次列表。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { TrainingCohortListResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type ListTrainingCohortsPayload = {
  sessionToken: SessionToken
}

export function createListTrainingCohortsRequest(
  sessionToken: SessionToken,
): ApiRequest<ListTrainingCohortsPayload, TrainingCohortListResponse> {
  return {
    name: 'ListTrainingCohortsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/cohorts/list',
    payload: { sessionToken },
  }
}
