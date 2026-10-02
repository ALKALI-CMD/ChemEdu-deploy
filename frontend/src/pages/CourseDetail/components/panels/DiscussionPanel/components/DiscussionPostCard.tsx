import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import { zh } from '@/lib/localization'
import DiscussionPostActions from './DiscussionPostActions'
import DiscussionPostHeader from './DiscussionPostHeader'
import DiscussionReplyList from './DiscussionReplyList'
import DiscussionTopicEditor from './DiscussionTopicEditor'
import TeacherHighlightsPanel from './TeacherHighlightsPanel'

type DiscussionPostCardProps = {
  discussion: DiscussionTopic
  canModerate: boolean
  replyDraft: string
  submitting: boolean
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

export default function DiscussionPostCard({
  discussion,
  canModerate,
  replyDraft,
  submitting,
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
}: DiscussionPostCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <DiscussionPostHeader discussion={discussion} canModerate={canModerate} />
        <DiscussionPostActions
          discussion={discussion}
          canModerate={canModerate}
          isOwnTopic={isOwnTopic}
          onStartTopicEditing={onStartTopicEditing}
          onDeleteTopic={onDeleteTopic}
          onModerateTopic={onModerateTopic}
          onToggleReaction={onToggleReaction}
          onReport={onReport}
        />
      </div>

      {editingTopicId === discussion.id ? (
        <DiscussionTopicEditor
          title={editingTopicTitle}
          content={editingTopicContent}
          onTitleChange={onEditingTopicTitleChange}
          onContentChange={onEditingTopicContentChange}
          onCancel={onCancelTopicEditing}
          onSave={onSaveTopic}
        />
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-700">{zh(discussion.content)}</p>
      )}

      <TeacherHighlightsPanel highlights={discussion.teacherHighlights} />

      <DiscussionReplyList
        topic={discussion}
        canModerate={canModerate}
        canReply={canReplyToTopic(discussion)}
        replyDraft={replyDraft}
        submitting={submitting}
        editingReplyId={editingReplyId}
        editingReplyContent={editingReplyContent}
        isOwnReply={isOwnReply}
        onReplyDraftChange={(value) => onReplyChange(discussion.id, value)}
        onReply={onReply}
        onStartReplyEditing={onStartReplyEditing}
        onCancelReplyEditing={onCancelReplyEditing}
        onEditingReplyContentChange={onEditingReplyContentChange}
        onSaveReply={onSaveReply}
        onDeleteReply={onDeleteReply}
        onModerateReply={onModerateReply}
        onReport={onReport}
      />
    </div>
  )
}
