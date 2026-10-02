// 文件说明：定义认证用户Profile领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'

export type UserProfile = {
  id: UserId
  name: string
  email: string
  role: UserRole
  age?: number
  grade?: string
  subject?: string
  departmentId?: string
  departmentName?: string
  majorId?: string
  majorName?: string
  academicClassId?: string
  academicClassName?: string
  bio: string
  avatarUrl?: string
  permissions?: string[]
}
