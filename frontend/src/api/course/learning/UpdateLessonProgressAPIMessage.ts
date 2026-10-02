// 文件说明：前端学习接口封装，用于发起更新课时进度请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { EntityResponse } from '@/lib/apiResponse'
import type { SessionToken } from '@/objects/auth/SessionToken'
import type { LessonProgressStatus } from '@/objects/course/learning/LessonProgressStatus'

export type LessonProgressPayload = {
  lessonId: string
  status: LessonProgressStatus
  studyMinutes: number
  lastPositionSeconds: number
  completedPreviewResourceIds: string[]
  playbackRate: number
}

export type UpdateLessonProgressPayload = {
  sessionToken: SessionToken
  lessonId: string
  status: LessonProgressStatus
  studyMinutes?: number
  lastPositionSeconds?: number
  completedPreviewResourceIds?: string[]
  playbackRate?: number
  eventType?: string
}

function parseLessonProgressResponse(response: unknown): LessonProgressPayload {
  const parsed = response as EntityResponse<'lessonId', string> & {
    status: LessonProgressStatus
    studyMinutes: number
    lastPositionSeconds: number
    completedPreviewResourceIds?: string[]
    playbackRate?: number
  }

  return {
    lessonId: parsed.lessonId,
    status: parsed.status,
    studyMinutes: parsed.studyMinutes,
    lastPositionSeconds: parsed.lastPositionSeconds,
    completedPreviewResourceIds: parsed.completedPreviewResourceIds ?? [],
    playbackRate: parsed.playbackRate ?? 1,
  }
}

export function createUpdateLessonProgressRequest(
  sessionToken: SessionToken,
  lessonId: string,
  status: LessonProgressStatus,
  studyMinutes?: number,
  lastPositionSeconds?: number,
  completedPreviewResourceIds?: string[],
  playbackRate?: number,
  eventType?: string,
): ApiRequest<UpdateLessonProgressPayload, LessonProgressPayload> {
  return {
    name: 'UpdateLessonProgressAPIMessage',
    method: 'PATCH',
    path: `/api/v1/lessons/${lessonId}/progress`,
    payload: {
      sessionToken,
      lessonId,
      status,
      studyMinutes,
      lastPositionSeconds,
      completedPreviewResourceIds,
      playbackRate,
      eventType,
    },
    parseResponse: parseLessonProgressResponse,
  }
}
