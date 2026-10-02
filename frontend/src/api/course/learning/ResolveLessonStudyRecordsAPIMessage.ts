// 文件说明：前端学习接口封装，用于发起解析课时StudyRecords请求并约束响应类型。
import type { ApiRequest } from '@/lib/apiClient'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { LessonStudyRecord } from '@/objects/course/learning/LessonStudyRecord'

export type LessonStudyRecordMap = Record<string, LessonStudyRecord>

export type ResolveLessonStudyRecordsPayload = {
  currentUser: UserProfile
}

export function createResolveLessonStudyRecordsRequest(
  currentUser: UserProfile,
): ApiRequest<ResolveLessonStudyRecordsPayload, LessonStudyRecordMap> {
  return {
    name: 'ResolveLessonStudyRecordsAPIMessage',
    method: 'POST',
    path: '/api/ResolveLessonStudyRecordsAPIMessage',
    payload: { currentUser },
  }
}
