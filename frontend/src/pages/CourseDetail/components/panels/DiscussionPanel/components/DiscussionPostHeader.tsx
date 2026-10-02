import { DiscussionStatusBadges, StatusHeatBadge } from '@/components/education/VisualStates'
import { Badge } from '@/components/ui/UiComponents'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import { zh } from '@/lib/localization'

type DiscussionPostHeaderProps = {
  discussion: DiscussionTopic
  canModerate: boolean
}

export default function DiscussionPostHeader({ discussion, canModerate }: DiscussionPostHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-slate-950">{zh(discussion.title)}</p>
        {discussion.lessonTitle ? (
          <Badge className="rounded-full bg-sky-50 text-sky-800 hover:bg-sky-50">{zh(discussion.lessonTitle)}</Badge>
        ) : (
          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">课程整体</Badge>
        )}
        <DiscussionStatusBadges
          resolved={discussion.resolved}
          pinned={discussion.pinState === DiscussionPinState.Pinned}
          locked={discussion.threadState === DiscussionThreadState.Locked}
          hidden={discussion.visibility === DiscussionVisibility.Hidden}
        />
        <StatusHeatBadge score={discussion.heatScore} />
        {discussion.sensitiveHitCount > 0 ? (
          <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50">
            敏感词 {discussion.sensitiveHitCount}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm text-slate-500">
        {zh(discussion.author)} · 创建于 {zh(discussion.createdAt)} · 最近更新 {zh(discussion.lastReplyAt)}
      </p>
      {discussion.resolved && discussion.resolvedBy ? (
        <p className="text-sm text-emerald-700">
          处理结果：{zh(discussion.resolvedBy)}
          {discussion.resolvedAt ? ` 于 ${zh(discussion.resolvedAt)}` : ''} 标记为已解决。
        </p>
      ) : null}
      {canModerate && discussion.moderationNote ? (
        <p className="text-sm text-amber-700">
          审核说明：{zh(discussion.moderationNote)}
          {discussion.moderatedBy ? `（${zh(discussion.moderatedBy)}）` : ''}
        </p>
      ) : null}
    </div>
  )
}
