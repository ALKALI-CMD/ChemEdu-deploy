// 文件说明：定义课程报名课程报名领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type CourseEnrollment = {
  userId: UserId
  courseId: string
  enrolledAt: string
  status: string
}
