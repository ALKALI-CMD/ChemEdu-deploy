import DiscussionComposer from './DiscussionComposer'

type DiscussionComposerSectionProps = {
  canPost: boolean
  showComposer: boolean
  lessonOptions: Array<{ id: string; title: string }>
  composerLessonId: string
  topicTitle: string
  topicContent: string
  submittingKey: string | null
  onComposerLessonChange: (value: string) => void
  onTopicTitleChange: (value: string) => void
  onTopicContentChange: (value: string) => void
  onCreateTopic: (lessonId?: string) => Promise<void>
}

export default function DiscussionComposerSection({
  canPost,
  showComposer,
  lessonOptions,
  composerLessonId,
  topicTitle,
  topicContent,
  submittingKey,
  onComposerLessonChange,
  onTopicTitleChange,
  onTopicContentChange,
  onCreateTopic,
}: DiscussionComposerSectionProps) {
  if (!canPost) {
    return <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">报名后可参与讨论。</p>
  }

  if (!showComposer) return null

  return (
    <DiscussionComposer
      lessonOptions={lessonOptions}
      selectedLessonId={composerLessonId}
      topicTitle={topicTitle}
      topicContent={topicContent}
      submitting={submittingKey === 'topic'}
      onLessonChange={onComposerLessonChange}
      onTopicTitleChange={onTopicTitleChange}
      onTopicContentChange={onTopicContentChange}
      onCreateTopic={() => onCreateTopic(composerLessonId === 'general' ? undefined : composerLessonId)}
    />
  )
}
