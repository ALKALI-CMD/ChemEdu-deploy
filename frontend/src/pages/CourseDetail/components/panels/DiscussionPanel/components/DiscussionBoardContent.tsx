import { CardContent } from '@/components/ui/UiComponents'
import type { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import type { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import type { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import DiscussionBoardToolbarSection from './DiscussionBoardToolbarSection'
import DiscussionComposerSection from './DiscussionComposerSection'
import DiscussionPostList from './DiscussionPostList'
import DiscussionSummaryPanel from './DiscussionSummaryPanel'
import type { useDiscussionBoardState } from '../hooks/useDiscussionBoardState'

type DiscussionBoardContentProps = {
  discussions: DiscussionTopic[]
  lessonOptions: Array<{ id: string; title: string }>
  canPost: boolean
  canModerate: boolean
  composerLessonId: string
  topicTitle: string
  topicContent: string
  replyDrafts: Record<string, string>
  submittingKey: string | null
  boardState: ReturnType<typeof useDiscussionBoardState>
  onComposerLessonChange: (value: string) => void
  onTopicTitleChange: (value: string) => void
  onTopicContentChange: (value: string) => void
  onReplyChange: (topicId: string, value: string) => void
  onCreateTopic: (lessonId?: string) => Promise<void>
  onReply: (topicId: string) => Promise<void>
  onUpdateTopic: (topicId: string, title: string, content: string) => Promise<void>
  onDeleteTopic: (topicId: string) => Promise<void>
  onUpdateReply: (replyId: string, content: string) => Promise<void>
  onDeleteReply: (replyId: string) => Promise<void>
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

export default function DiscussionBoardContent({
  discussions,
  lessonOptions,
  canPost,
  canModerate,
  composerLessonId,
  topicTitle,
  topicContent,
  replyDrafts,
  submittingKey,
  boardState,
  onComposerLessonChange,
  onTopicTitleChange,
  onTopicContentChange,
  onReplyChange,
  onCreateTopic,
  onReply,
  onUpdateTopic,
  onDeleteTopic,
  onUpdateReply,
  onDeleteReply,
  onModerateTopic,
  onModerateReply,
  onToggleReaction,
  onReport,
}: DiscussionBoardContentProps) {
  return (
    <CardContent className="space-y-5">
      <DiscussionSummaryPanel discussions={discussions} />

      <DiscussionBoardToolbarSection
        canPost={canPost}
        canModerate={canModerate}
        lessonOptions={lessonOptions}
        boardState={boardState}
      />

      <DiscussionComposerSection
        canPost={canPost}
        showComposer={boardState.showComposer}
        lessonOptions={lessonOptions}
        composerLessonId={composerLessonId}
        topicTitle={topicTitle}
        topicContent={topicContent}
        submittingKey={submittingKey}
        onComposerLessonChange={onComposerLessonChange}
        onTopicTitleChange={onTopicTitleChange}
        onTopicContentChange={onTopicContentChange}
        onCreateTopic={onCreateTopic}
      />

      <DiscussionPostList
        discussions={boardState.pagedDiscussions}
        canModerate={canModerate}
        replyDrafts={replyDrafts}
        submittingKey={submittingKey}
        editingTopicId={boardState.editingTopicId}
        editingTopicTitle={boardState.editingTopicTitle}
        editingTopicContent={boardState.editingTopicContent}
        editingReplyId={boardState.editingReplyId}
        editingReplyContent={boardState.editingReplyContent}
        isOwnTopic={boardState.isOwnTopic}
        isOwnReply={boardState.isOwnReply}
        canReplyToTopic={boardState.canReplyToTopic}
        onReplyChange={onReplyChange}
        onStartTopicEditing={boardState.startTopicEditing}
        onCancelTopicEditing={boardState.cancelTopicEditing}
        onEditingTopicTitleChange={boardState.setEditingTopicTitle}
        onEditingTopicContentChange={(setEditingContent) => boardState.setEditingTopicContent(setEditingContent)}
        onSaveTopic={() => boardState.saveTopic((topicId, title, content) => onUpdateTopic(topicId, title, content))}
        onDeleteTopic={onDeleteTopic}
        onStartReplyEditing={boardState.startReplyEditing}
        onCancelReplyEditing={boardState.cancelReplyEditing}
        onEditingReplyContentChange={boardState.setEditingReplyContent}
        onSaveReply={() => boardState.saveReply(onUpdateReply)}
        onDeleteReply={onDeleteReply}
        onReply={onReply}
        onModerateTopic={onModerateTopic}
        onModerateReply={onModerateReply}
        onToggleReaction={onToggleReaction}
        onReport={onReport}
      />
    </CardContent>
  )
}
