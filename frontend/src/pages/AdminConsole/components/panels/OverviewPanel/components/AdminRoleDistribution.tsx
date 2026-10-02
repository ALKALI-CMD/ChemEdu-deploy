import type { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { Card, CardContent } from '@/components/ui/UiComponents'

type AdminRoleDistributionProps = {
  dashboard: EducationDashboardResponse
  roleLabel: Record<UserRole, string>
}

export default function AdminRoleDistribution({ dashboard, roleLabel }: AdminRoleDistributionProps) {
  const usersByRole = Object.entries(roleLabel).map(([role, label]) => ({
    role,
    label,
    count: dashboard.users.filter((user) => user.role === role).length,
  }))

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">角色分布</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {usersByRole.map((item) => (
            <div key={item.role} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{item.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
