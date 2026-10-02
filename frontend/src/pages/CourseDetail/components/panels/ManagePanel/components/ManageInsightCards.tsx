import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'
import type { ManageDrilldownKey } from '../functions/manageStatusModel'

type ManageInsightCardsProps = {
  atRiskStudents: TeachingInsightSnapshot['atRiskStudents']
  bottlenecks: TeachingInsightSnapshot['lessonBottlenecks']
  averageCompletionRate: number
  onSelect: (value: ManageDrilldownKey) => void
}

export default function ManageInsightCards({
  atRiskStudents,
  bottlenecks,
  averageCompletionRate,
  onSelect,
}: ManageInsightCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <button
        type="button"
        className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-left transition hover:shadow-sm"
        onClick={() => onSelect('risk')}
      >
        <p className="text-sm text-rose-700">待干预学生</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{atRiskStudents.length}</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">点击查看掉队学生的风险原因和待处理任务。</p>
      </button>
      <button
        type="button"
        className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:shadow-sm"
        onClick={() => onSelect('bottleneck')}
      >
        <p className="text-sm text-amber-700">课时卡点</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{bottlenecks.length}</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">点击查看完成率偏低、学习成本偏高的课时明细。</p>
      </button>
      <button
        type="button"
        className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-left transition hover:shadow-sm"
        onClick={() => onSelect('distribution')}
      >
        <p className="text-sm text-sky-700">平均完成率</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{averageCompletionRate}%</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">点击查看不同完成度区间的人数分布。</p>
      </button>
    </div>
  )
}
