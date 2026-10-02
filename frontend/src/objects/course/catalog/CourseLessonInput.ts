// 文件说明：定义课程目录课程课时领域数据类型，用于业务流程和接口传输。
import type { LessonContentBlock } from '@/objects/course/catalog/LessonContentBlock'
import type { LessonType } from '@/objects/course/catalog/LessonType'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

export type CourseLessonInput = {
  id?: string
  title: string
  duration: string
  type: LessonType
  completed: boolean
  contentBlocks: LessonContentBlock[]
  resourceAttachments: AssignmentAttachment[]
  videoUrl?: string
  documentUrl?: string
  unlockAfterLessonId?: string
  requiredStudyMinutes: number
}
