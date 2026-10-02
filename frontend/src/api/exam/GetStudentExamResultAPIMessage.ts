// 文件说明：前端考试评定接口封装，用于学生查询自己的考试成绩与智能分析。
import type { ApiRequest } from '@/lib/apiClient'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { StudentExamResultResponse } from '@/objects/exam/apiTypes/ExamApiResponses'

export type GetStudentExamResultPayload = {
  sessionToken: SessionToken
  examId: string
}

export function createGetStudentExamResultRequest(
  sessionToken: SessionToken,
  examId: string,
): ApiRequest<GetStudentExamResultPayload, StudentExamResultResponse> {
  return {
    name: 'GetStudentExamResultAPIMessage',
    method: 'POST',
    path: '/api/v1/exam/result',
    payload: { sessionToken, examId },
  }
}
