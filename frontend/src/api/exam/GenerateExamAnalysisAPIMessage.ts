// 文件说明：前端考试评定接口封装，用于生成学生考试智能分析报告。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { ExamAnalysisMutationResponse } from '@/objects/exam/apiTypes/InsightApiResponses'

export type GenerateExamAnalysisPayload = {
  sessionToken: SessionToken
  examId: string
  studentId: string | null
}

export function createGenerateExamAnalysisRequest(
  sessionToken: SessionToken,
  examId: string,
  studentId: string | null = null,
): ApiRequest<GenerateExamAnalysisPayload, ExamAnalysisMutationResponse> {
  return {
    name: 'GenerateExamAnalysisAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/analysis',
    payload: { sessionToken, examId, studentId },
  }
}
