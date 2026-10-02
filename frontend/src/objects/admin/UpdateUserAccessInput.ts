// 文件说明：定义管理端更新用户访问权限领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'

export type UpdateUserAccessInput = {
  userId: UserId
  role: UserRole
  permissions: string[]
}
