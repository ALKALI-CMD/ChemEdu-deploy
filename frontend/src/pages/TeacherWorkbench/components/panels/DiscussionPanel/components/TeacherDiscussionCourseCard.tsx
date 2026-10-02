import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import { zh } from '@/lib/localization'
import TeacherDiscussionTopicCard from './TeacherDiscussionTopicCard'

type TeacherDiscussionCourseCardProps = {
  course: Course
  topics: DiscussionTopic[]
  totalTopics: number
  hiddenTopics: number
  lockedTopics: number
  pinnedTopics: number
  myTopics: number
  onModerateTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) => Promise<void>
}

export default function TeacherDiscussionCourseCard({
  course,
  topics,
  totalTopics,
  hiddenTopics,
  lockedTopics,
  pinnedTopics,
  myTopics,
  onModerateTopic,
}: TeacherDiscussionCourseCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="space-y-2">
        <p className="font-semibold text-slate-950">{zh(course.title)}</p>
        <p className="text-sm leading-6 text-slate-600">{zh(course.subtitle)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="rounded-full bg-white text-slate-900 hover:bg-white">主题 {totalTopics}</Badge>
        <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">已隐藏 {hiddenTopics}</Badge>
        <Badge className="rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100">已锁帖 {lockedTopics}</Badge>
        <Badge className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100">已置顶 {pinnedTopics}</Badge>
        <Badge className="rounded-full bg-slate-200 text-slate-900 hover:bg-slate-200">我发起的 {myTopics}</Badge>
      </div>

      <div className="mt-4 space-y-3">
        {topics.slice(0, 4).map((topic) => (
          <TeacherDiscussionTopicCard key={topic.id} topic={topic} onModerateTopic={onModerateTopic} />
        ))}

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            当前这门课程下没有符合筛选条件的讨论主题。
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
          <Link to={`/course/${course.id}/discussions`}>进入课程讨论区</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
          <Link to={`/course/${course.id}/manage`}>进入课程管理区</Link>
        </Button>
      </div>
    </div>
  )
}
