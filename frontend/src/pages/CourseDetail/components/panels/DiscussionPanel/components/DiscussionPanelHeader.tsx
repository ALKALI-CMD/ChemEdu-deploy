import { CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import DiscussionStatsGrid from './DiscussionStatsGrid'

type DiscussionPanelHeaderProps = {
  discussions: DiscussionTopic[]
  focusLessonId?: string
  focusedLessonTitle?: string
}

export default function DiscussionPanelHeader({
  discussions,
  focusLessonId,
  focusedLessonTitle,
}: DiscussionPanelHeaderProps) {
  const unresolvedCount = discussions.filter((item) => !item.resolved).length
  const linkedLessonCount = discussions.filter((item) => item.lessonId).length
  const teacherHighlightCount = discussions.reduce((sum, item) => sum + item.teacherHighlights.length, 0)

  return (
    <CardHeader className="space-y-4">
      <div className="space-y-2">
        <CardTitle className="text-slate-950">课程讨论区</CardTitle>
      </div>

      {focusLessonId ? (
        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-medium text-sky-950">当前课时：{focusedLessonTitle ?? '当前课时'}</p>
        </div>
      ) : null}

      <DiscussionStatsGrid
        unresolvedCount={unresolvedCount}
        linkedLessonCount={linkedLessonCount}
        teacherHighlightCount={teacherHighlightCount}
      />
    </CardHeader>
  )
}
