import { MetricCard } from '@/components/education/DisplayPrimitives'
import type { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

type AdminOverviewStatsProps = {
  dashboard: EducationDashboardResponse
  roleLabel: Record<UserRole, string>
}

export default function AdminOverviewStats({ dashboard }: AdminOverviewStatsProps) {
  const platformStats = [
    {
      label: '平台注册用户',
      value: dashboard.analytics.registeredUsers,
      tone: 'border-slate-950 bg-slate-950 text-white',
      subTone: 'text-slate-300',
      valueTone: 'text-white',
    },
    {
      label: '待审核课程',
      value: dashboard.courses.filter((course) => course.auditStatus === CourseAuditStatus.Pending).length,
      tone: 'border-sky-200 bg-sky-50 text-slate-900',
      subTone: 'text-slate-500',
      valueTone: 'text-slate-950',
    },
    {
      label: '待治理内容',
      value: dashboard.discussions.filter(
        (topic) => topic.visibility === DiscussionVisibility.Hidden || topic.threadState === DiscussionThreadState.Locked,
      ).length,
      tone: 'border-amber-200 bg-amber-50 text-slate-900',
      subTone: 'text-slate-500',
      valueTone: 'text-slate-950',
    },
    {
      label: '平台总课程数',
      value: dashboard.courses.length,
      tone: 'border-emerald-200 bg-emerald-50 text-slate-900',
      subTone: 'text-slate-500',
      valueTone: 'text-slate-950',
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {platformStats.map((item) => (
        <MetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          className={item.tone}
          labelClassName={item.subTone}
          valueClassName={item.valueTone}
        />
      ))}
    </div>
  )
}
