import type { Course } from '@/objects/course/catalog/Course'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import TeacherMetricCard from './TeacherMetricCard'

type TeacherOverviewMetricsProps = {
  courses: Course[]
  assignments: Assignment[]
  dashboard: EducationDashboardResponse
}

export default function TeacherOverviewMetrics({ courses, assignments, dashboard }: TeacherOverviewMetricsProps) {
  const pendingReviews = assignments.filter((assignment) => assignment.submissionStatus === SubmissionStatus.Submitted).length
  const insights = dashboard.teachingInsights

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <TeacherMetricCard
        label="教学课程数"
        value={courses.length}
        cardClassName="border-slate-950 bg-slate-950 text-white"
        labelClassName="text-slate-300"
        valueClassName="text-white"
      />
      <TeacherMetricCard
        label="累计报名人数"
        value={courses.reduce((sum, course) => sum + course.enrolledCount, 0)}
        cardClassName="border-sky-200 bg-sky-50 text-slate-900"
        labelClassName="text-slate-500"
      />
      <TeacherMetricCard
        label="待批改作业"
        value={pendingReviews}
        cardClassName="border-amber-200 bg-amber-50 text-slate-900"
        labelClassName="text-slate-500"
      />
      <TeacherMetricCard
        label="待干预学生"
        value={insights.interventionQueueCount}
        cardClassName="border-rose-200 bg-rose-50 text-slate-900"
        labelClassName="text-slate-500"
      />
    </div>
  )
}
