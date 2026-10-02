import { Card } from '@/components/ui/UiComponents'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { UserId } from '@/objects/auth/UserId'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import DiscussionBoardContent from './components/DiscussionBoardContent'
import DiscussionPanelHeader from './components/DiscussionPanelHeader'
import { useDiscussionBoardState } from './hooks/useDiscussionBoardState'

type DiscussionPanelProps = {
  discussions: DiscussionTopic[]
  lessonOptions: Array<{ id: string; title: string }>
  focusLessonId?: string
  currentUserId: UserId
  canPost: boolean
  canModerate: boolean
  composerLessonId: string
  topicTitle: string
  topicContent: string
  replyDrafts: Record<string, string>
  submittingKey: string | null
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

export default function DiscussionPanel({
  discussions,
  lessonOptions,
  focusLessonId,
  currentUserId,
  canPost,
  canModerate,
  composerLessonId,
  topicTitle,
  topicContent,
  replyDrafts,
  submittingKey,
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
}: DiscussionPanelProps) {
  const boardState = useDiscussionBoardState(discussions, currentUserId, canPost, canModerate, focusLessonId)
  const focusedLessonTitle = lessonOptions.find((item) => item.id === focusLessonId)?.title

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <DiscussionPanelHeader discussions={discussions} focusLessonId={focusLessonId} focusedLessonTitle={focusedLessonTitle} />
      <DiscussionBoardContent
        discussions={discussions}
        lessonOptions={lessonOptions}
        canPost={canPost}
        canModerate={canModerate}
        composerLessonId={composerLessonId}
        topicTitle={topicTitle}
        topicContent={topicContent}
        replyDrafts={replyDrafts}
        submittingKey={submittingKey}
        boardState={boardState}
        onComposerLessonChange={onComposerLessonChange}
        onTopicTitleChange={onTopicTitleChange}
        onTopicContentChange={onTopicContentChange}
        onReplyChange={onReplyChange}
        onCreateTopic={onCreateTopic}
        onReply={onReply}
        onUpdateTopic={onUpdateTopic}
        onDeleteTopic={onDeleteTopic}
        onUpdateReply={onUpdateReply}
        onDeleteReply={onDeleteReply}
        onModerateTopic={onModerateTopic}
        onModerateReply={onModerateReply}
        onToggleReaction={onToggleReaction}
        onReport={onReport}
      />
    </Card>
  )
}
