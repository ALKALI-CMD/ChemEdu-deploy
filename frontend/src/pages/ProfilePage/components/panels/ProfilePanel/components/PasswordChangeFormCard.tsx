import { InlineNotice, type NoticeState } from '@/components/ExperienceState'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui/UiComponents'

type PasswordChangeFormCardProps = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  notice: NoticeState
  saving: boolean
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSave: () => void
}

export default function PasswordChangeFormCard({
  currentPassword,
  newPassword,
  confirmPassword,
  notice,
  saving,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSave,
}: PasswordChangeFormCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">修改密码</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <InlineNotice notice={notice} />

        <div className="grid gap-2">
          <Label htmlFor="current-password">当前密码</Label>
          <Input id="current-password" type="password" value={currentPassword} onChange={(event) => onCurrentPasswordChange(event.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="new-password">新密码</Label>
          <Input id="new-password" type="password" value={newPassword} onChange={(event) => onNewPasswordChange(event.target.value)} />
          <p className="text-xs text-slate-500">至少 8 位，包含字母和数字。</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm-password">确认新密码</Label>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => onConfirmPasswordChange(event.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={onSave} disabled={saving}>
            {saving ? '提交中...' : '更新密码'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
