type DiscussionStatsGridProps = {
  unresolvedCount: number
  linkedLessonCount: number
  teacherHighlightCount: number
}

export default function DiscussionStatsGrid({
  unresolvedCount,
  linkedLessonCount,
  teacherHighlightCount,
}: DiscussionStatsGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">未解决主题</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{unresolvedCount}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">已关联课时</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{linkedLessonCount}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">教师总结条目</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{teacherHighlightCount}</p>
      </div>
    </div>
  )
}
