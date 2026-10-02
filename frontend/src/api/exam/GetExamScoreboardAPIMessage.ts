// 文件说明：前端考试评定接口封装，用于教研与数据分析处查看折合分成绩册。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ScoreboardResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type GetExamScoreboardPayload = {
  sessionToken: SessionToken
  examId: string
}

export function createGetExamScoreboardRequest(
  sessionToken: SessionToken,
  examId: string,
): ApiRequest<GetExamScoreboardPayload, ScoreboardResponse> {
  return {
    name: 'GetExamScoreboardAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/scoreboard',
    payload: { sessionToken, examId },
  }
}
