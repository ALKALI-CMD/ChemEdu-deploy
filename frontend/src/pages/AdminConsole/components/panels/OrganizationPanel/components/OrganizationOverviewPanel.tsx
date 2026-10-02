import { OrganizationModuleLink, OrganizationStatCard } from './OrganizationSharedComponents'

type OrganizationOverviewPanelProps = {
  departmentCount: number
  majorCount: number
  academicClassCount: number
  semesterCount: number
  pendingEnrollmentCount: number
  waitlistCount: number
  studentCount: number
  courseCount: number
  logCount: number
}

export default function OrganizationOverviewPanel({
  departmentCount,
  majorCount,
  academicClassCount,
  semesterCount,
  pendingEnrollmentCount,
  waitlistCount,
  studentCount,
  courseCount,
  logCount,
}: OrganizationOverviewPanelProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <OrganizationStatCard title="院系" value={String(departmentCount)} />
        <OrganizationStatCard title="专业" value={String(majorCount)} />
        <OrganizationStatCard title="教学班" value={String(academicClassCount)} />
        <OrganizationStatCard title="学期" value={String(semesterCount)} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OrganizationModuleLink to="/admin/organization/enrollments" title="选课审核" description="处理需要管理员审批的报名申请。" badge={`${pendingEnrollmentCount} 个待审核`} />
        <OrganizationModuleLink to="/admin/organization/waitlist" title="候补名单" description="管理满员课程的候补转正。" badge={`${waitlistCount} 个候补`} />
        <OrganizationModuleLink to="/admin/organization/structure" title="组织结构" description="维护院系、专业、教学班和学期。" badge={`${academicClassCount} 个教学班`} />
        <OrganizationModuleLink to="/admin/organization/students" title="学生调班" description="批量分配或清空学生班级归属。" badge={`${studentCount} 名学生`} />
        <OrganizationModuleLink to="/admin/organization/courses" title="课程分班" description="维护课程与教学班的关联关系。" badge={`${courseCount} 门课程`} />
        <OrganizationModuleLink to="/admin/organization/logs" title="变更日志" description="查看组织、班级和课程关联变更记录。" badge={`${logCount} 条记录`} />
      </section>
    </>
  )
}
