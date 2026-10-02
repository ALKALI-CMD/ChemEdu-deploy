import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'
import type { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'
import UserAccessCard from './UserAccessCard'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'

type UserRoleGroupProps = {
  label: string
  role: UserRole
  users: UserProfile[]
  detailUserId?: string
  roleOptions: readonly UserRole[]
  roleLabel: Record<UserRole, string>
  roleDrafts: Record<string, UserRole>
  permissionDrafts: Record<string, string>
  busyKey: string | null
  operationLogs: OperationLogItem[]
  onRoleSelect: (userId: UserProfile['id'], role: UserRole) => void
  onPermissionChange: (userId: UserProfile['id'], value: string) => void
  onSave: (userId: UserProfile['id'], fallbackRole: UserRole) => Promise<void>
}

export default function UserRoleGroup({
  label,
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
}: UserRoleGroupProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-slate-950">{label}</p>
        <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">{users.length} 人</Badge>
      </div>

      {users
        .filter((user) => !detailUserId || user.id === detailUserId)
        .map((user) => (
        detailUserId ? (
        <UserAccessCard
          key={user.id}
          user={user}
          roleOptions={roleOptions}
          roleLabel={roleLabel}
          roleDraft={roleDrafts[user.id] ?? user.role}
          permissionDraft={permissionDrafts[user.id] ?? user.permissions?.join(',') ?? ''}
          busy={busyKey === `user:${user.id}`}
          userLogs={operationLogs.filter((item) => item.target.includes(user.name))}
          onRoleSelect={onRoleSelect}
          onPermissionChange={onPermissionChange}
          onSave={onSave}
        />
        ) : (
          <Link key={user.id} to={`/admin/users/${user.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
              <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
                当前角色：{roleLabel[user.role]}
              </Badge>
            </div>
          </Link>
        )
      ))}
    </section>
  )
}
