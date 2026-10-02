import { kindDotClass, type SessionEvent } from '../functions/lessonStudyUtils'

type LessonStudyTimelinePanelProps = {
  events: SessionEvent[]
}

export default function LessonStudyTimelinePanel({ events }: LessonStudyTimelinePanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">最近学习事件</p>
      <div className="mt-3 space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="flex gap-3 rounded-2xl bg-white p-4">
              <div className={`mt-1 h-3 w-3 rounded-full ${kindDotClass(event.kind)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-950">{event.label}</p>
                  <span className="text-xs text-slate-500">{event.createdAt}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">暂无学习事件。</div>
        )}
      </div>
    </div>
  )
}
