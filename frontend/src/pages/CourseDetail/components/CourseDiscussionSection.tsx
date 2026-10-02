import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import DiscussionPanel from './panels/DiscussionPanel/DiscussionPanel'
import type { useCourseDetailWorkspaceModel } from '../hooks/useCourseDetailWorkspaceModel'
import type { useCourseDiscussionActions } from '../hooks/useCourseDiscussionActions'

type CourseDiscussionSectionProps = {
  dashboard: EducationDashboardResponse
  focusLessonId?: string
  model: ReturnType<typeof useCourseDetailWorkspaceModel>
  discussionActions: ReturnType<typeof useCourseDiscussionActions>
}

export default function CourseDiscussionSection({
  dashboard,
  focusLessonId,
  model,
  discussionActions,
}: CourseDiscussionSectionProps) {
  return (
    <DiscussionPanel
      discussions={model.relatedDiscussions}
      lessonOptions={model.lessonOptions}
      focusLessonId={focusLessonId as string | undefined}
      currentUserId={dashboard.currentUser.id}
      canPost={model.canDiscuss}
      canModerate={model.canManage}
      composerLessonId={discussionActions.composerLessonId}
      topicTitle={discussionActions.topicTitle}
      topicContent={discussionActions.topicContent}
      replyDrafts={discussionActions.replyDrafts}
      submittingKey={discussionActions.discussionSubmittingKey}
      onComposerLessonChange={discussionActions.setComposerLessonId}
      onTopicTitleChange={discussionActions.setTopicTitle}
      onTopicContentChange={discussionActions.setTopicContent}
      onReplyChange={(topicId, value) => discussionActions.setReplyDrafts((current) => ({ ...current, [topicId]: value }))}
      onCreateTopic={discussionActions.handleCreateDiscussionTopic}
      onReply={discussionActions.handleReplyDiscussionTopic}
      onUpdateTopic={discussionActions.handleUpdateDiscussionTopic}
      onDeleteTopic={discussionActions.handleDeleteDiscussionTopic}
      onUpdateReply={discussionActions.handleUpdateDiscussionReply}
      onDeleteReply={discussionActions.handleDeleteDiscussionReply}
      onModerateTopic={discussionActions.handleModerateDiscussionTopic}
      onModerateReply={discussionActions.handleModerateDiscussionReply}
      onToggleReaction={discussionActions.handleToggleDiscussionReaction}
      onReport={discussionActions.handleCreatePlatformReport}
    />
  )
}
