// 文件说明：定义管理端评价/批改报名领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type ReviewEnrollmentData = {
  courseId: string
  userId: UserId
  approved: boolean
}
