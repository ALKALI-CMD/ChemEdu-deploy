import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'
import AdminPanelShell from '../../AdminPanelShell'
import UserRoleGroup from './components/UserRoleGroup'
import type { OperationLogItem } from '../../../objects/adminConsoleConfig'

type UserAccessPanelProps = {
  users: UserProfile[]
  detailUserId?: string
  roleOptions: readonly UserRole[]
  roleLabel: Record<UserRole, string>
  roleDrafts: Record<string, UserRole>
  permissionDrafts: Record<string, string>
  busyKey: string | null
  operationLogs: OperationLogItem[]
  onRoleSelect: (userId: UserId, role: UserRole) => void
  onPermissionChange: (userId: UserId, value: string) => void
  onSave: (userId: UserId, fallbackRole: UserRole) => Promise<void>
}

export default function UserAccessPanel({
  users,
  detailUserId,
  roleOptions,
  roleLabel,
  roleDrafts,
  permissionDrafts,
  busyKey,
  operationLogs,
  onRoleSelect,
  onPermissionChange,
  onSave,
}: UserAccessPanelProps) {
  const groupedUsers = roleOptions.map((role) => ({
    role,
    label: roleLabel[role],
    users: users.filter((user) => user.role === role),
  }))

  return (
    <AdminPanelShell title="用户权限" description="按学生、教师、管理员分组查看；课程助教在具体课程内邀请和授权。">
      {groupedUsers.map((group) => (
        <UserRoleGroup
          key={group.role}
          label={group.label}
          role={group.role}
          users={group.users}
          detailUserId={detailUserId}
          roleOptions={roleOptions}
          roleLabel={roleLabel}
          roleDrafts={roleDrafts}
          permissionDrafts={permissionDrafts}
          busyKey={busyKey}
          operationLogs={operationLogs}
          onRoleSelect={onRoleSelect}
          onPermissionChange={onPermissionChange}
          onSave={onSave}
        />
      ))}
    </AdminPanelShell>
  )
}
