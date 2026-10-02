import { UserRole } from '@/objects/auth/UserRole'

export function roleBadgeLabel(role: UserRole) {
  switch (role) {
    case UserRole.Teacher:
      return '教师'
    case UserRole.Admin:
      return '管理员'
    case UserRole.Assistant:
      return '助教'
    default:
      return null
  }
}
