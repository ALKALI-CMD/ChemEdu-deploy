import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

type DiscussionSummaryPanelProps = {
  discussions: DiscussionTopic[]
}

export default function DiscussionSummaryPanel({ discussions }: DiscussionSummaryPanelProps) {
  const resolvedTopics = discussions.filter((item) => item.resolved).slice(0, 4)
  const teacherSummaryCards = discussions
    .filter((item) => item.teacherHighlights.length > 0)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      lessonTitle: item.lessonTitle ?? '课程整体讨论',
      highlightCount: item.teacherHighlights.length,
      latestSummary: item.teacherHighlights[0]?.content ?? '暂无教师总结。',
    }))

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">教师总结卡</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
            {teacherSummaryCards.length} 条
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {teacherSummaryCards.length > 0 ? (
            teacherSummaryCards.map((card) => (
              <div key={card.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-950">{card.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {card.lessonTitle} / 教师总结 {card.highlightCount} 条
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{card.latestSummary}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">暂无教师总结卡。</div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">已解决主题</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{resolvedTopics.length} 条</span>
        </div>
        <div className="mt-4 space-y-3">
          {resolvedTopics.length > 0 ? (
            resolvedTopics.map((topic) => (
              <div key={topic.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-950">{topic.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {topic.lessonTitle ?? '课程整体'} / {topic.resolvedBy ?? '教师'} / {topic.resolvedAt ?? '最近'}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{topic.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">暂无已解决主题。</div>
          )}
        </div>
      </div>
    </section>
  )
}
