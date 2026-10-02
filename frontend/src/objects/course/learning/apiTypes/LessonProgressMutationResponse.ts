// 文件说明：定义学习课时进度变更接口响应类型，用于前后端 API 返回值约束。
import type { LessonProgressStatus } from '@/objects/course/learning/LessonProgressStatus'

export type LessonProgressMutationResponse = {
  message: string
  lessonId: string
  status: LessonProgressStatus
  studyMinutes: number
  lastPositionSeconds: number
  completedPreviewResourceIds: string[]
  playbackRate: number
}
