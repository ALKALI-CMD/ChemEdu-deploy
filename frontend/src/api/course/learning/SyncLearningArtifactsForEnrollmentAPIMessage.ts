// 文件说明：前端学习接口封装，用于发起同步学习ArtifactsFor报名请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import { parseMessageText } from '@/lib/apiResponse'

export type SyncLearningArtifactsForEnrollmentPayload = {
  studentId: string
  courseId: string
}

export function createSyncLearningArtifactsForEnrollmentRequest(
  studentId: string,
  courseId: string,
): ApiRequest<SyncLearningArtifactsForEnrollmentPayload, string> {
  return {
    name: 'SyncLearningArtifactsForEnrollmentAPIMessage',
    method: 'POST',
    path: '/api/SyncLearningArtifactsForEnrollmentAPIMessage',
    payload: { studentId, courseId },
    parseResponse: parseMessageText,
  }
}
