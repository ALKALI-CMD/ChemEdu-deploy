import { Badge, Button, Input } from '@/components/ui/UiComponents'
import type { UserId } from '@/objects/auth/UserId'
import type { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'

type UserAccessCardProps = {
  user: UserProfile
  roleOptions: readonly UserRole[]
  roleLabel: Record<UserRole, string>
  roleDraft: UserRole
  permissionDraft: string
  busy: boolean
  userLogs: OperationLogItem[]
  onRoleSelect: (userId: UserId, role: UserRole) => void
  onPermissionChange: (userId: UserId, value: string) => void
  onSave: (userId: UserId, fallbackRole: UserRole) => Promise<void>
}

export default function UserAccessCard({
  user,
  roleOptions,
  roleLabel,
  roleDraft,
  permissionDraft,
  busy,
  userLogs,
  onRoleSelect,
  onPermissionChange,
  onSave,
}: UserAccessCardProps) {
  const permissions = permissionDraft
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const mergedPermissions = permissions.length > 0 ? permissions : user.permissions ?? []
  const banned = mergedPermissions.includes('user:banned')

  function setBanned(nextBanned: boolean) {
    const nextPermissions = new Set(mergedPermissions)
    if (nextBanned) {
      nextPermissions.add('user:banned')
    } else {
      nextPermissions.delete('user:banned')
    }
    onPermissionChange(user.id, Array.from(nextPermissions).join(','))
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
          当前角色：{roleLabel[user.role]}
        </Badge>
        {banned ? (
          <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50">
            已封禁
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {roleOptions.map((role) => (
          <Button
            key={`${user.id}-${role}`}
            type="button"
            variant={roleDraft === role ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => onRoleSelect(user.id, role)}
          >
            {roleLabel[role]}
          </Button>
        ))}
      </div>

      <Input
        className="mt-4 bg-white"
        placeholder="以逗号分隔权限，例如：course:audit,user:manage"
        value={permissionDraft}
        onChange={(event) => onPermissionChange(user.id, event.target.value)}
      />

      <div className="mt-4 space-y-2">
        <p className="text-sm text-slate-500">已有权限：{user.permissions?.join(', ') || '无额外权限'}</p>
        {userLogs.length > 0 ? (
          <div className="rounded-2xl bg-white p-3">
            {userLogs.slice(0, 3).map((item) => (
              <p key={item.id} className="text-xs text-slate-500">
                {item.createdAt} / {item.action}
                {item.detail ? ` / ${item.detail}` : ''}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className={banned ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-800' : 'rounded-full border-rose-200 bg-rose-50 text-rose-700'}
          onClick={() => setBanned(!banned)}
        >
          {banned ? '解除封禁' : '封禁用户'}
        </Button>
        <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" disabled={busy} onClick={() => void onSave(user.id, user.role)}>
          保存访问控制
        </Button>
      </div>
    </div>
  )
}
