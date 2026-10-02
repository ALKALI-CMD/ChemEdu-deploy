import { Badge } from '@/components/ui/UiComponents'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import { zh } from '@/lib/localization'
import { roleBadgeLabel } from './discussionPostUtils'

type TeacherHighlightsPanelProps = {
  highlights: DiscussionTopic['teacherHighlights']
}

export default function TeacherHighlightsPanel({ highlights }: TeacherHighlightsPanelProps) {
  if (highlights.length === 0) {
    return null
  }

  return (
    <div className="mt-4 rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
      <p className="text-sm font-medium text-sky-950">教师总结</p>
      <div className="mt-3 space-y-3">
        {highlights.map((highlight) => (
          <div key={highlight.id} className="rounded-2xl bg-white px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-slate-950">{zh(highlight.author)}</p>
              {roleBadgeLabel(highlight.authorRole) ? (
                <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{roleBadgeLabel(highlight.authorRole)}</Badge>
              ) : null}
              <p className="text-xs text-slate-500">{zh(highlight.createdAt)}</p>
            </div>
            <p className="mt-2 leading-6 text-slate-700">{zh(highlight.content)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
