import type { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import AdminOperationLogPanel from './components/AdminOperationLogPanel'
import AdminOverviewStats from './components/AdminOverviewStats'
import AdminPlatformCharts from './components/AdminPlatformCharts'
import AdminRoleDistribution from './components/AdminRoleDistribution'
import type { OperationLogItem } from '../../../objects/adminConsoleConfig'

type AdminOverviewProps = {
  dashboard: EducationDashboardResponse
  roleLabel: Record<UserRole, string>
  operationLogs: OperationLogItem[]
}

export default function AdminOverview({ dashboard, roleLabel, operationLogs }: AdminOverviewProps) {
  return (
    <>
      <AdminOverviewStats dashboard={dashboard} roleLabel={roleLabel} />
      <AdminPlatformCharts dashboard={dashboard} roleLabel={roleLabel} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <AdminRoleDistribution dashboard={dashboard} roleLabel={roleLabel} />
        <AdminOperationLogPanel operationLogs={operationLogs} />
      </div>
    </>
  )
}
