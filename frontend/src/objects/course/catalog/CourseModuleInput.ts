// 文件说明：定义课程目录课程Module领域数据类型，用于业务流程和接口传输。
import type { CourseLessonInput } from '@/objects/course/catalog/CourseLessonInput'

export type CourseModuleInput = {
  id?: string
  title: string
  lessons: CourseLessonInput[]
}
