// 文件说明：前端考试评定接口封装，用于助教老师为答题卡单题打分。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { QuestionScoreMutationResponse } from '@/objects/exam/apiTypes/GradingApiResponses'

export type SaveQuestionScorePayload = {
  sessionToken: SessionToken
  sheetId: string
  questionId: string
  score: number
  comment: string
}

export function createSaveQuestionScoreRequest(
  payload: SaveQuestionScorePayload,
): ApiRequest<SaveQuestionScorePayload, QuestionScoreMutationResponse> {
  return {
    name: 'SaveQuestionScoreAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/scores',
    payload,
  }
}
