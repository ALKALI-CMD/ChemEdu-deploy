import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/UiComponents'
import { DiscussionStatusBadges, StatusHeatBadge } from '@/components/education/VisualStates'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import { zh } from '@/lib/localization'

type TeacherDiscussionTopicCardProps = {
  topic: DiscussionTopic
  onModerateTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) => Promise<void>
}

export default function TeacherDiscussionTopicCard({ topic, onModerateTopic }: TeacherDiscussionTopicCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-slate-950">{zh(topic.title)}</p>
        <DiscussionStatusBadges
          resolved={topic.resolved}
          pinned={topic.pinState === DiscussionPinState.Pinned}
          locked={topic.threadState === DiscussionThreadState.Locked}
          hidden={topic.visibility === DiscussionVisibility.Hidden}
        />
        <StatusHeatBadge score={topic.heatScore} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {zh(topic.author)} / 最近更新：{zh(topic.lastReplyAt)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
          <Link to={`/course/${topic.courseId}/discussions`}>查看详情</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
          onClick={() =>
            void onModerateTopic(
              topic.id,
              topic.visibility,
              topic.threadState,
              topic.pinState === DiscussionPinState.Pinned ? DiscussionPinState.Normal : DiscussionPinState.Pinned,
            )
          }
        >
          {topic.pinState === DiscussionPinState.Pinned ? '取消置顶' : '置顶'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
          onClick={() =>
            void onModerateTopic(
              topic.id,
              topic.visibility,
              topic.threadState === DiscussionThreadState.Locked ? DiscussionThreadState.Open : DiscussionThreadState.Locked,
              topic.pinState,
            )
          }
        >
          {topic.threadState === DiscussionThreadState.Locked ? '解锁' : '锁帖'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
          onClick={() =>
            void onModerateTopic(
              topic.id,
              topic.visibility === DiscussionVisibility.Hidden ? DiscussionVisibility.Visible : DiscussionVisibility.Hidden,
              topic.threadState,
              topic.pinState,
            )
          }
        >
          {topic.visibility === DiscussionVisibility.Hidden ? '恢复显示' : '隐藏'}
        </Button>
      </div>
    </div>
  )
}
