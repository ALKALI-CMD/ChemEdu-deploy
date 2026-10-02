import ReportButton from '@/components/ReportButton'
import { Badge, Button } from '@/components/ui/UiComponents'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import { zh } from '@/lib/localization'

type DiscussionPostActionsProps = {
  discussion: DiscussionTopic
  canModerate: boolean
  isOwnTopic: (topic: DiscussionTopic) => boolean
  onStartTopicEditing: (topic: DiscussionTopic) => void
  onDeleteTopic: (topicId: string) => Promise<void>
  onModerateTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: boolean,
    moderationNote?: string,
  ) => Promise<void>
  onToggleReaction: (topicId: string, reactionType: 'like' | 'favorite' | 'report') => Promise<void>
  onReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

export default function DiscussionPostActions({
  discussion,
  canModerate,
  isOwnTopic,
  onStartTopicEditing,
  onDeleteTopic,
  onModerateTopic,
  onToggleReaction,
  onReport,
}: DiscussionPostActionsProps) {
  async function handleDeleteTopic(topicId: string) {
    if (window.confirm('确认删除这个讨论主题吗？删除后其下所有回复也会一起删除。')) {
      await onDeleteTopic(topicId)
    }
  }

  async function handleToggleTopicPin(topic: DiscussionTopic) {
    const moderationNote = window.prompt('可选：填写置顶说明（可留空）。')?.trim()
    await onModerateTopic(
      topic.id,
      topic.visibility,
      topic.threadState,
      topic.pinState === DiscussionPinState.Pinned ? DiscussionPinState.Normal : DiscussionPinState.Pinned,
      topic.resolved,
      moderationNote || undefined,
    )
  }

  async function handleToggleTopicLock(topic: DiscussionTopic) {
    const moderationNote = window.prompt('可选：填写锁帖说明（可留空）。')?.trim()
    await onModerateTopic(
      topic.id,
      topic.visibility,
      topic.threadState === DiscussionThreadState.Locked ? DiscussionThreadState.Open : DiscussionThreadState.Locked,
      topic.pinState,
      topic.resolved,
      moderationNote || undefined,
    )
  }

  async function handleToggleTopicVisibility(topic: DiscussionTopic) {
    const moderationNote = window.prompt('可选：填写审核说明（可留空）。')?.trim()
    await onModerateTopic(
      topic.id,
      topic.visibility === DiscussionVisibility.Hidden ? DiscussionVisibility.Visible : DiscussionVisibility.Hidden,
      topic.threadState,
      topic.pinState,
      topic.resolved,
      moderationNote || undefined,
    )
  }

  async function handleToggleTopicResolved(topic: DiscussionTopic) {
    const moderationNote = window.prompt(`可选：填写${topic.resolved ? '恢复未解决' : '解决说明'}（可留空）。`)?.trim()
    await onModerateTopic(
      topic.id,
      topic.visibility,
      topic.threadState,
      topic.pinState,
      !topic.resolved,
      moderationNote || undefined,
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
        {discussion.replyCount} 条回复
      </Badge>
      {discussion.teacherHighlights.length > 0 ? (
        <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
          教师总结 {discussion.teacherHighlights.length}
        </Badge>
      ) : null}
      <Button
        type="button"
        variant={discussion.likedByCurrentUser ? 'secondary' : 'outline'}
        className="rounded-full"
        onClick={() => void onToggleReaction(discussion.id, 'like')}
      >
        点赞 {discussion.likeCount}
      </Button>
      <Button
        type="button"
        variant={discussion.favoritedByCurrentUser ? 'secondary' : 'outline'}
        className="rounded-full"
        onClick={() => void onToggleReaction(discussion.id, 'favorite')}
      >
        收藏 {discussion.favoriteCount}
      </Button>
      <ReportButton
        targetType="discussion"
        targetId={discussion.id}
        targetLabel={zh(discussion.title)}
        label={`举报主题${discussion.reportCount > 0 ? ` ${discussion.reportCount}` : ''}`}
        className="rounded-full"
        onSubmit={onReport}
      />
      {!isOwnTopic(discussion) ? (
        <ReportButton
          targetType="user"
          targetId={discussion.authorId}
          targetLabel={zh(discussion.author)}
          label="举报用户"
          className="rounded-full"
          onSubmit={onReport}
        />
      ) : null}
      {canModerate ? (
        <>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleToggleTopicResolved(discussion)}>
            {discussion.resolved ? '恢复未解决' : '标记已解决'}
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleToggleTopicPin(discussion)}>
            {discussion.pinState === DiscussionPinState.Pinned ? '取消置顶' : '置顶'}
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleToggleTopicLock(discussion)}>
            {discussion.threadState === DiscussionThreadState.Locked ? '解锁' : '锁帖'}
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleToggleTopicVisibility(discussion)}>
            {discussion.visibility === DiscussionVisibility.Hidden ? '恢复显示' : '隐藏'}
          </Button>
        </>
      ) : null}
      {isOwnTopic(discussion) ? (
        <>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onStartTopicEditing(discussion)}>
            编辑主题
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={() => void handleDeleteTopic(discussion.id)}
          >
            删除主题
          </Button>
        </>
      ) : null}
    </div>
  )
}
