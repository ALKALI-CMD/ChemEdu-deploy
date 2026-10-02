// 文件说明：定义管理端权限MatrixEntry领域数据类型，用于业务流程和接口传输。
import type { UserRole } from '@/objects/auth/UserRole'

export type PermissionMatrixEntry = {
  role: UserRole
  permissionKey: string
  action: string
  resourceType: string
  scope: string
  allowed: boolean
}
