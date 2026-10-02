import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import DiscussionPostCard from './DiscussionPostCard'

type DiscussionPostListProps = {
  discussions: DiscussionTopic[]
  canModerate: boolean
  replyDrafts: Record<string, string>
  submittingKey: string | null
  editingTopicId: string | null
  editingTopicTitle: string
  editingTopicContent: string
  editingReplyId: string | null
  editingReplyContent: string
  isOwnTopic: (topic: DiscussionTopic) => boolean
  isOwnReply: (reply: DiscussionTopic['replies'][number]) => boolean
  canReplyToTopic: (topic: DiscussionTopic) => boolean
  onReplyChange: (topicId: string, value: string) => void
  onStartTopicEditing: (topic: DiscussionTopic) => void
  onCancelTopicEditing: () => void
  onEditingTopicTitleChange: (value: string) => void
  onEditingTopicContentChange: (value: string) => void
  onSaveTopic: () => Promise<void>
  onDeleteTopic: (topicId: string) => Promise<void>
  onStartReplyEditing: (reply: DiscussionTopic['replies'][number]) => void
  onCancelReplyEditing: () => void
  onEditingReplyContentChange: (value: string) => void
  onSaveReply: () => Promise<void>
  onDeleteReply: (replyId: string) => Promise<void>
  onReply: (topicId: string) => Promise<void>
  onModerateTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: boolean,
    moderationNote?: string,
  ) => Promise<void>
  onModerateReply: (replyId: string, visibility: DiscussionVisibility, moderationNote?: string) => Promise<void>
  onToggleReaction: (topicId: string, reactionType: 'like' | 'favorite' | 'report') => Promise<void>
  onReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

export default function DiscussionPostList({
  discussions,
  canModerate,
  replyDrafts,
  submittingKey,
  editingTopicId,
  editingTopicTitle,
  editingTopicContent,
  editingReplyId,
  editingReplyContent,
  isOwnTopic,
  isOwnReply,
  canReplyToTopic,
  onReplyChange,
  onStartTopicEditing,
  onCancelTopicEditing,
  onEditingTopicTitleChange,
  onEditingTopicContentChange,
  onSaveTopic,
  onDeleteTopic,
  onStartReplyEditing,
  onCancelReplyEditing,
  onEditingReplyContentChange,
  onSaveReply,
  onDeleteReply,
  onReply,
  onModerateTopic,
  onModerateReply,
  onToggleReaction,
  onReport,
}: DiscussionPostListProps) {
  if (discussions.length === 0) {
    return (
      <EmptyIllustrationState
        kind="discussion"
        title="暂无匹配讨论"
        message="当前筛选条件下还没有匹配的讨论，可以调整筛选或发起新的课程讨论。"
      />
    )
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <DiscussionPostCard
          key={discussion.id}
          discussion={discussion}
          canModerate={canModerate}
          replyDraft={replyDrafts[discussion.id] ?? ''}
          submitting={submittingKey === `reply:${discussion.id}`}
          editingTopicId={editingTopicId}
          editingTopicTitle={editingTopicTitle}
          editingTopicContent={editingTopicContent}
          editingReplyId={editingReplyId}
          editingReplyContent={editingReplyContent}
          isOwnTopic={isOwnTopic}
          isOwnReply={isOwnReply}
          canReplyToTopic={canReplyToTopic}
          onReplyChange={onReplyChange}
          onStartTopicEditing={onStartTopicEditing}
          onCancelTopicEditing={onCancelTopicEditing}
          onEditingTopicTitleChange={onEditingTopicTitleChange}
          onEditingTopicContentChange={onEditingTopicContentChange}
          onSaveTopic={onSaveTopic}
          onDeleteTopic={onDeleteTopic}
          onStartReplyEditing={onStartReplyEditing}
          onCancelReplyEditing={onCancelReplyEditing}
          onEditingReplyContentChange={onEditingReplyContentChange}
          onSaveReply={onSaveReply}
          onDeleteReply={onDeleteReply}
          onReply={onReply}
          onModerateTopic={onModerateTopic}
          onModerateReply={onModerateReply}
          onToggleReaction={onToggleReaction}
          onReport={onReport}
        />
      ))}
    </div>
  )
}
