// 文件说明：前端考试评定接口封装，用于数据分析处拉取考试统计聚合。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ExamStatisticsResponse } from '@/objects/exam/apiTypes/InsightApiResponses'

export type GetExamStatisticsPayload = {
  sessionToken: SessionToken
  cohortId: string | null
}

export function createGetExamStatisticsRequest(
  sessionToken: SessionToken,
  cohortId: string | null = null,
): ApiRequest<GetExamStatisticsPayload, ExamStatisticsResponse> {
  return {
    name: 'GetExamStatisticsAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/statistics',
    payload: { sessionToken, cohortId },
  }
}
