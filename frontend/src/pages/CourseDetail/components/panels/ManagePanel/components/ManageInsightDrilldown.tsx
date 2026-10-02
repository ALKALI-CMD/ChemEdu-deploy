import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/UiComponents'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'
import { buildLessonLink, text, type ManageDrilldownKey } from '../functions/manageStatusModel'

type ManageInsightDrilldownProps = {
  courseId: string
  activeDrilldown: ManageDrilldownKey
  atRiskStudents: TeachingInsightSnapshot['atRiskStudents']
  bottlenecks: TeachingInsightSnapshot['lessonBottlenecks']
  distribution: TeachingInsightSnapshot['completionDistributions'][number] | undefined
  onSelect: (value: ManageDrilldownKey) => void
}

export default function ManageInsightDrilldown({
  courseId,
  activeDrilldown,
  atRiskStudents,
  bottlenecks,
  distribution,
  onSelect,
}: ManageInsightDrilldownProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">点击下钻明细</p>
          <p className="mt-1 text-sm text-slate-600">在这里快速切换课程内的高风险学生、卡点课时和完成率分布。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={activeDrilldown === 'risk' ? 'default' : 'outline'} className="rounded-full" onClick={() => onSelect('risk')}>
            掉队学生
          </Button>
          <Button type="button" variant={activeDrilldown === 'bottleneck' ? 'default' : 'outline'} className="rounded-full" onClick={() => onSelect('bottleneck')}>
            课时卡点
          </Button>
          <Button
            type="button"
            variant={activeDrilldown === 'distribution' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => onSelect('distribution')}
          >
            完成率分布
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {activeDrilldown === 'risk'
          ? atRiskStudents.map((student) => (
              <Link
                key={`${student.courseId}-${student.userId}`}
                to="/teacher/gradebook"
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{text(student.studentName)}</p>
                    <p className="text-sm text-slate-500">{text(student.courseTitle)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">进度 {student.completionRate}%</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">待作业 {student.pendingAssignmentCount}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">待测验 {student.pendingQuizCount}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{student.riskReasons.join('、')}</p>
              </Link>
            ))
          : null}

        {activeDrilldown === 'bottleneck'
          ? bottlenecks.map((lesson) => (
              <Link
                key={lesson.lessonId}
                to={buildLessonLink(courseId, lesson.lessonId)}
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{text(lesson.lessonTitle)}</p>
                    <p className="text-sm text-slate-500">{text(lesson.moduleTitle)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">完成率 {lesson.completionRate}%</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">平均 {lesson.averageStudyMinutes} 分钟</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">要求 {lesson.requiredStudyMinutes} 分钟</span>
                  </div>
                </div>
              </Link>
            ))
          : null}

        {activeDrilldown === 'distribution' && distribution ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DistributionCard label="优秀推进" value={distribution.excellentCount} className="border-emerald-200 bg-emerald-50 text-emerald-700" />
            <DistributionCard label="稳定推进" value={distribution.steadyCount} className="border-sky-200 bg-sky-50 text-sky-700" />
            <DistributionCard label="需要提醒" value={distribution.warningCount} className="border-amber-200 bg-amber-50 text-amber-700" />
            <DistributionCard label="明显掉队" value={distribution.stuckCount} className="border-rose-200 bg-rose-50 text-rose-700" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DistributionCard({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
