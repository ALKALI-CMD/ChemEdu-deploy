// 文件说明：定义学习更新课时进度领域数据类型，用于业务流程和接口传输。
import type { LessonProgressStatus } from '@/objects/course/learning/LessonProgressStatus'

export type UpdateLessonProgressInput = {
  lessonId: string
  status: LessonProgressStatus
  studyMinutes?: number
  lastPositionSeconds?: number
  completedPreviewResourceIds?: string[]
  playbackRate?: number
  eventType?: string
}
