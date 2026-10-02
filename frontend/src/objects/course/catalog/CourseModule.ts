// 文件说明：定义课程目录课程Module领域数据类型，用于业务流程和接口传输。
import type { Lesson } from '@/objects/course/catalog/Lesson'

export type CourseModule = {
  id: string
  title: string
  lessons: Lesson[]
}
