import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui/UiComponents'
import { UserRole } from '@/objects/auth/UserRole'
import type { UserProfile } from '@/objects/auth/UserProfile'
import { walletRechargeOptions } from '@/lib/wallet'
import { getDirectionLabel, roleLabel } from '../functions/profilePanelUtils'

type ProfileAccountOverviewPanelProps = {
  currentUser: UserProfile
  avatar: string | null
  walletBalance: number
  rechargeAmount: string
  onRechargeAmountChange: (value: string) => void
  onRecharge: (amount: number) => void
  onAvatarSelect: (files: FileList | null) => void
}

export default function ProfileAccountOverviewPanel({
  currentUser,
  avatar,
  walletBalance,
  rechargeAmount,
  onRechargeAmountChange,
  onRecharge,
  onAvatarSelect,
}: ProfileAccountOverviewPanelProps) {
  const directionLabel = getDirectionLabel(currentUser.role)

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">账号概览</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">身份</p>
          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
            {roleLabel[currentUser.role]}
          </Badge>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">头像</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-white">
              {avatar ? (
                <img src={avatar} alt="用户头像" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-950 text-lg font-semibold text-white">
                  {String(currentUser.name).slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
              上传头像
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  onAvatarSelect(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">邮箱</p>
          <p className="mt-1 text-base font-medium text-slate-950">{currentUser.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">用户 ID</p>
          <p className="mt-1 break-all text-sm text-slate-600">{currentUser.id}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">资料摘要</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>姓名：{currentUser.name}</p>
            <p>年龄：{currentUser.age ?? '未填写'}</p>
            {currentUser.role === UserRole.Student ? <p>年级：{currentUser.grade ?? '未填写'}</p> : null}
            <p>{directionLabel}：{currentUser.subject ?? '未填写'}</p>
            <p>简介：{currentUser.bio}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">平台余额</p>
              <p className="mt-1 text-xs text-slate-600">报名课程时可用。</p>
            </div>
            <p className="text-2xl font-semibold text-slate-950">¥{walletBalance}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <Input
              type="number"
              min={1}
              step={10}
              value={rechargeAmount}
              onChange={(event) => onRechargeAmountChange(event.target.value)}
              placeholder="输入充值金额"
            />
            <Button type="button" variant="outline" className="rounded-lg bg-white" onClick={() => onRecharge(Number(rechargeAmount))}>
              充值
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {walletRechargeOptions.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                className="rounded-full bg-white px-3"
                onClick={() => onRechargeAmountChange(String(amount))}
              >
                充 ¥{amount}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
