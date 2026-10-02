// 文件说明：定义课程目录更新课程状态领域数据类型，用于业务流程和接口传输。
import type { CourseStatus } from '@/objects/course/catalog/CourseStatus'

export type UpdateCourseStatusData = {
  courseId: string
  status: CourseStatus
}
