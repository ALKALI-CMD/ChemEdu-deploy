// 文件说明：前端考试评定接口封装，用于教研老师保存答题卡改题区域划分。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { GradingRegion } from '@/objects/exam/GradingRegion'
import type { ExamMutationResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type SaveGradingRegionsPayload = {
  sessionToken: SessionToken
  examId: string
  regions: Record<string, GradingRegion>
  sheetTemplateImage: string | null
}

export function createSaveGradingRegionsRequest(
  payload: SaveGradingRegionsPayload,
): ApiRequest<SaveGradingRegionsPayload, ExamMutationResponse> {
  return {
    name: 'SaveGradingRegionsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/regions',
    payload,
  }
}
