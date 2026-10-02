// 文件说明：定义课程评价课程评价/批改Entity领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type CourseReview = {
  id: string
  courseId: string
  userId: UserId
  author: string
  rating: number
  content: string
  createdAt: string
  updatedAt?: string
}
