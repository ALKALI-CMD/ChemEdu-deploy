import { ChartPanel, SimpleBarChart, type BarDatum } from '@/components/education/EducationCharts'
import type { UserRole } from '@/objects/auth/UserRole'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

type AdminPlatformChartsProps = {
  dashboard: EducationDashboardResponse
  roleLabel: Record<UserRole, string>
}

const auditLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '已通过',
  [CourseAuditStatus.Rejected]: '已驳回',
}

export default function AdminPlatformCharts({ dashboard, roleLabel }: AdminPlatformChartsProps) {
  const roleData: BarDatum[] = Object.entries(roleLabel).map(([role, label], index) => ({
    label,
    value: dashboard.users.filter((user) => user.role === role).length,
    fill: ['#0f172a', '#0ea5e9', '#f59e0b', '#10b981'][index],
  }))

  const auditData: BarDatum[] = Object.entries(auditLabel).map(([status, label], index) => ({
    label,
    value: dashboard.courses.filter((course) => course.auditStatus === status).length,
    fill: ['#f59e0b', '#10b981', '#f43f5e'][index],
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartPanel title="用户角色统计" description="展示学生、教师、助教和管理员的数量分布。">
        <SimpleBarChart data={roleData} />
      </ChartPanel>
      <ChartPanel title="课程审核状态" description="展示课程审核队列中的通过、待审和驳回情况。">
        <SimpleBarChart data={auditData} />
      </ChartPanel>
    </div>
  )
}
