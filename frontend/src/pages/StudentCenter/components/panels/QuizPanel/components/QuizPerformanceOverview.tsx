import { Badge } from '@/components/ui/UiComponents'
import type { CoursePerformanceCard } from '../functions/quizPanelUtils'

type QuizScoreTrendPoint = {
  id: string
  label: string
  score: number
  submittedAt: string
  courseTitle: string
}

type QuizPerformanceOverviewProps = {
  finishedCount: number
  coursePerformance: CoursePerformanceCard[]
  scoreTrend: QuizScoreTrendPoint[]
}

export default function QuizPerformanceOverview({
  finishedCount,
  coursePerformance,
  scoreTrend,
}: QuizPerformanceOverviewProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">按课程累计测验表现</p>
          </div>
          <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">已完成 {finishedCount} 场</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {coursePerformance.length > 0 ? (
            coursePerformance.map((entry) => (
              <div key={entry.courseId} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{entry.courseTitle}</p>
                    <p className="text-sm text-slate-500">
                      已完成 {entry.finishedCount} 场 / 最近提交 {entry.latestSubmittedAt ?? '暂无记录'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950">{entry.averageScore}</p>
                    <p className="text-xs text-slate-500">平均分</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    客观题正确率 {entry.averageAccuracy !== undefined ? `${entry.averageAccuracy}%` : '暂无'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              暂无测验记录。
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">最近成绩趋势</p>
        <div className="mt-4 space-y-3">
          {scoreTrend.length > 0 ? (
            scoreTrend.map((point, index) => (
              <div key={point.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{point.label}</p>
                    <p className="text-sm text-slate-500">{point.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-950">{point.score}</p>
                    <p className="text-xs text-slate-500">趋势点 {index + 1}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{point.submittedAt}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">暂无趋势数据。</div>
          )}
        </div>
      </div>
    </section>
  )
}
