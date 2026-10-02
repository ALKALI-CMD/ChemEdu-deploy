// 文件说明：定义课程目录课时内容Block领域数据类型，用于业务流程和接口传输。
import type { LessonContentType } from '@/objects/course/catalog/LessonContentType'

export type LessonContentBlock = {
  id: string
  contentType: LessonContentType
  title: string
  content: string
}
