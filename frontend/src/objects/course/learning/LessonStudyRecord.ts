// 文件说明：定义学习课时StudyRecord领域数据类型，用于业务流程和接口传输。
import type { LessonStudyTimelineEntry } from '@/objects/course/learning/LessonStudyTimelineEntry'

export type LessonStudyRecord = {
  studyMinutes: number
  lastPositionSeconds: number
  lastStudiedAt?: string
  recentTimeline: LessonStudyTimelineEntry[]
  completedPreviewResourceIds: string[]
  playbackRate: number
}
