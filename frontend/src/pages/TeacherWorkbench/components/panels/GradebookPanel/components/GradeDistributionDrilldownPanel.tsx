import { Badge } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

type CourseDistribution = EducationDashboardResponse['teachingInsights']['courseGradeDistributions'][number]
type ClassDistribution = EducationDashboardResponse['teachingInsights']['classGradeDistributions'][number]

type GradeDistributionDrilldownPanelProps = {
  courseGradeDistributions: CourseDistribution[]
  visibleCourseDistributions: CourseDistribution[]
  visibleClassDistributions: ClassDistribution[]
  selectedCourseId: string
  onSelectedCourseIdChange: (courseId: string) => void
}

export default function GradeDistributionDrilldownPanel({
  courseGradeDistributions,
  visibleCourseDistributions,
  visibleClassDistributions,
  selectedCourseId,
  onSelectedCourseIdChange,
}: GradeDistributionDrilldownPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm font-medium text-slate-900">课程 / 班级分布下钻</p>
        <select
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
          value={selectedCourseId}
          onChange={(event) => onSelectedCourseIdChange(event.target.value)}
        >
          <option value="all">全部课程</option>
          {courseGradeDistributions.map((item) => (
            <option key={item.courseId} value={item.courseId}>
              {item.courseTitle}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">按课程看总评分布</p>
          <div className="mt-3 space-y-3">
            {visibleCourseDistributions.map((entry) => (
              <div key={entry.courseId} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{entry.courseTitle}</p>
                    <p className="text-sm text-slate-500">
                      平均分 {entry.averageScore} / 及格率 {entry.passRate} / 优秀率 {entry.excellentRate}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{entry.studentCount} 人</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-4">
                  <span className="rounded-full bg-rose-50 px-3 py-1">不及格 {entry.failCount}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1">及格 {entry.passCount}</span>
                  <span className="rounded-full bg-sky-50 px-3 py-1">良好 {entry.goodCount}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1">优秀 {entry.excellentCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">按班级看总评分布</p>
          <div className="mt-3 space-y-3">
            {visibleClassDistributions.length > 0 ? (
              visibleClassDistributions.map((entry) => (
                <div key={`${entry.courseId}-${entry.academicClassId}`} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{entry.academicClassName}</p>
                      <p className="text-sm text-slate-500">
                        {entry.courseTitle} / 平均分 {entry.averageScore} / 及格率 {entry.passRate}
                      </p>
                    </div>
                    <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{entry.studentCount} 人</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-4">
                    <span className="rounded-full bg-rose-50 px-3 py-1">不及格 {entry.failCount}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1">及格 {entry.passCount}</span>
                    <span className="rounded-full bg-sky-50 px-3 py-1">良好 {entry.goodCount}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1">优秀 {entry.excellentCount}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                暂无班级维度分布数据。
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
