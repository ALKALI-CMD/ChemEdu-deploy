import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import DiscussionReplyComposer from './DiscussionReplyComposer'
import DiscussionReplyItem from './DiscussionReplyItem'

type DiscussionReplyListProps = {
  topic: DiscussionTopic
  canModerate: boolean
  canReply: boolean
  replyDraft: string
  submitting: boolean
  editingReplyId: string | null
  editingReplyContent: string
  isOwnReply: (reply: DiscussionTopic['replies'][number]) => boolean
  onReplyDraftChange: (value: string) => void
  onReply: (topicId: string) => Promise<void>
  onStartReplyEditing: (reply: DiscussionTopic['replies'][number]) => void
  onCancelReplyEditing: () => void
  onEditingReplyContentChange: (value: string) => void
  onSaveReply: () => Promise<void>
  onDeleteReply: (replyId: string) => Promise<void>
  onModerateReply: (replyId: string, visibility: DiscussionVisibility, moderationNote?: string) => Promise<void>
  onReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

export default function DiscussionReplyList({
  topic,
  canModerate,
  canReply,
  replyDraft,
  submitting,
  editingReplyId,
  editingReplyContent,
  isOwnReply,
  onReplyDraftChange,
  onReply,
  onStartReplyEditing,
  onCancelReplyEditing,
  onEditingReplyContentChange,
  onSaveReply,
  onDeleteReply,
  onModerateReply,
  onReport,
}: DiscussionReplyListProps) {
  return (
    <>
      <div className="mt-4 space-y-3">
        {topic.replies.length === 0 ? (
          <p className="text-sm text-slate-500">还没有回复，欢迎发起第一条交流。</p>
        ) : (
          topic.replies.map((reply) => (
            <DiscussionReplyItem
              key={reply.id}
              reply={reply}
              canModerate={canModerate}
              editing={editingReplyId === reply.id}
              editingReplyContent={editingReplyContent}
              ownReply={isOwnReply(reply)}
              onStartReplyEditing={onStartReplyEditing}
              onCancelReplyEditing={onCancelReplyEditing}
              onEditingReplyContentChange={onEditingReplyContentChange}
              onSaveReply={onSaveReply}
              onDeleteReply={onDeleteReply}
              onModerateReply={onModerateReply}
              onReport={onReport}
            />
          ))
        )}
      </div>

      {canReply ? (
        <DiscussionReplyComposer
          replyDraft={replyDraft}
          submitting={submitting}
          topicId={topic.id}
          onReplyDraftChange={onReplyDraftChange}
          onReply={onReply}
        />
      ) : null}
    </>
  )
}
