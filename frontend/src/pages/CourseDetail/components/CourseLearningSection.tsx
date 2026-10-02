import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import LearningPanel from './panels/LearningPanel/LearningPanel'
import type { useCourseDetailActions } from '../hooks/useCourseDetailActions'
import type { useCourseDetailWorkspaceModel } from '../hooks/useCourseDetailWorkspaceModel'
import type { useCourseDiscussionActions } from '../hooks/useCourseDiscussionActions'

type CourseLearningSectionProps = {
  dashboard: EducationDashboardResponse
  focusLessonId?: string
  model: ReturnType<typeof useCourseDetailWorkspaceModel>
  courseActions: ReturnType<typeof useCourseDetailActions>
  discussionActions: ReturnType<typeof useCourseDiscussionActions>
  reviewSubmitting: boolean
  onOpenLessonDiscussion: (courseId: string, lessonId: string) => void
}

export default function CourseLearningSection({
  dashboard,
  focusLessonId,
  model,
  courseActions,
  discussionActions,
  reviewSubmitting,
  onOpenLessonDiscussion,
}: CourseLearningSectionProps) {
  if (!model.course) {
    return null
  }

  return (
    <LearningPanel
      course={model.course}
      assignments={model.relatedAssignments}
      quizzes={model.relatedQuizzes}
      reviews={model.relatedReviews}
      enrolled={model.enrolled}
      canManage={model.canManage}
      canStudy={model.canStudy}
      currentUserId={dashboard.currentUser.id}
      currentRole={dashboard.currentUser.role}
      teacherName={model.teacherName}
      assistantNames={model.assistantNames}
      focusLessonId={focusLessonId}
      discussionCountByLessonId={model.discussionCountByLessonId}
      reviewSubmitting={reviewSubmitting}
      onReport={discussionActions.handleCreatePlatformReport}
      onEnroll={courseActions.handleEnroll}
      onToggleLessonProgress={courseActions.handleToggleLessonProgress}
      onRecordLessonStudy={courseActions.handleRecordLessonStudy}
      onOpenLessonDiscussion={(lessonId) => onOpenLessonDiscussion(model.course!.id, lessonId)}
      onSubmitReview={courseActions.handleSubmitCourseReview}
    />
  )
}
