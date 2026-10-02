import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import GradebookMetric from './GradebookMetric'

type GradebookOverviewPanelProps = {
  overallCourseAverage: string
  overallPassRate: string
  overallExcellentRate: string
  insights: EducationDashboardResponse['teachingInsights']
}

export default function GradebookOverviewPanel({
  overallCourseAverage,
  overallPassRate,
  overallExcellentRate,
  insights,
}: GradebookOverviewPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">整体概览</p>
        <div className="mt-4 grid gap-3">
          <GradebookMetric label="课程平均分" value={overallCourseAverage} />
          <GradebookMetric label="平均及格率" value={overallPassRate} />
          <GradebookMetric label="平均优秀率" value={overallExcellentRate} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 xl:col-span-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-slate-900">待干预学生全名单</p>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
            共 {insights.atRiskStudents.length} 人
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {insights.atRiskStudents.length > 0 ? (
            insights.atRiskStudents.map((student) => (
              <div key={`${student.courseId}-${student.userId}`} className="rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{student.studentName}</p>
                    <p className="text-sm text-slate-500">{student.courseTitle}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                    进度 {student.completionRate}%
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">待作业 {student.pendingAssignmentCount}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">待测验 {student.pendingQuizCount}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">均分 {student.averageScore}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{student.riskReasons.join('、')}</p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">
              当前没有高风险学生，整体学情表现稳定。
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
