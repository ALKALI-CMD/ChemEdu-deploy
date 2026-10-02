// 文件说明：定义课程报名候补名单Entry领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type WaitlistEntry = {
  userId: UserId
  courseId: string
  queuedAt: string
  position: number
}
