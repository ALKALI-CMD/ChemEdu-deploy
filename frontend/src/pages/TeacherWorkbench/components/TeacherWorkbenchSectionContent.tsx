import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import AssignmentReviewPanel from './panels/AssignmentReviewPanel/AssignmentReviewPanel'
import LearningPublishPanel from './panels/LearningPublishPanel/LearningPublishPanel'
import TeacherDiscussionPanel from './panels/DiscussionPanel/DiscussionPanel'
import TeacherGradebookPanel from './panels/GradebookPanel/GradebookPanel'
import TeacherOverview from './panels/OverviewPanel/OverviewPanel'
import TeacherCoursesSection from './panels/CoursesPanel/CoursesPanel'
import TeacherOverviewHighlights from './panels/OverviewPanel/components/TeacherOverviewHighlights'
import ExamManagementPanel from './panels/ExamManagementPanel/ExamManagementPanel'
import ExamGradingPanel from './panels/ExamGradingPanel/ExamGradingPanel'
import type { useTeacherWorkbenchActions } from '../hooks/useTeacherWorkbenchActions'
import type { useTeacherWorkbenchState } from '../hooks/useTeacherWorkbenchState'
import type { useTeacherWorkbenchViewModel } from '../hooks/useTeacherWorkbenchViewModel'
import { exportAssignmentSubmissions } from '../functions/teacherAssignmentExport'
import type { TeacherWorkbenchSection } from '../objects/teacherWorkbenchConfig'

type TeacherWorkbenchRouteParams = {
  courseId?: string
  assignmentId?: string
  quizId?: string
}

type TeacherWorkbenchSectionContentProps = {
  section: TeacherWorkbenchSection
  dashboard: EducationDashboardResponse
  dashboardApi: EducationDashboardContextValue
  routeParams: TeacherWorkbenchRouteParams
  effectiveSelectedCourseId: string | null
  effectiveCourseFormMode: ReturnType<typeof useTeacherWorkbenchState>['courseFormMode']
  state: ReturnType<typeof useTeacherWorkbenchState>
  viewModel: ReturnType<typeof useTeacherWorkbenchViewModel>
  actions: ReturnType<typeof useTeacherWorkbenchActions>
}

export default function TeacherWorkbenchSectionContent({
  section,
  dashboard,
  dashboardApi,
  routeParams,
  effectiveSelectedCourseId,
  effectiveCourseFormMode,
  state,
  viewModel,
  actions,
}: TeacherWorkbenchSectionContentProps) {
  if (section === 'overview') {
    return (
      <>
        <TeacherOverview courses={viewModel.teacherCourses} assignments={viewModel.reviewAssignments} dashboard={dashboard} />
        <TeacherOverviewHighlights
          pendingReviewCount={viewModel.pendingReviewCount}
          pendingDiscussionCount={viewModel.pendingDiscussionCount}
          pendingAuditCount={viewModel.pendingAuditCount}
        />
      </>
    )
  }

  if (section === 'courses') {
    return (
      <TeacherCoursesSection
        teacherCourses={viewModel.teacherCourses}
        canManage={viewModel.canManage}
        selectedCourseId={effectiveSelectedCourseId}
        selectedCourseIds={state.selectedCourseIds}
        courseFormMode={effectiveCourseFormMode}
        setSelectedCourseId={state.setSelectedCourseId}
        setCourseFormMode={state.setCourseFormMode}
        setSelectedCourseIds={state.setSelectedCourseIds}
        selectedCourse={viewModel.selectedCourse}
        editingCourse={viewModel.editingCourse}
        canDirectPublishCourse={viewModel.canDirectPublishCourse}
        dashboardUsers={dashboard.users}
        onToggleCourseStatus={actions.handleToggleCourseStatus}
        onBatchStatusChange={actions.handleBatchStatusChange}
        onSaveCourse={actions.handleSaveCourse}
      />
    )
  }

  if (section === 'publishing') {
    return (
      <LearningPublishPanel
        courses={viewModel.teacherCourses}
        publishing={state.publishingLearningTask}
        onPublishAssignment={actions.handlePublishAssignment}
        onPublishQuiz={actions.handlePublishQuiz}
      />
    )
  }

  if (section === 'reviews') {
    return (
      <AssignmentReviewPanel
        courses={viewModel.teacherCourses}
        assignments={viewModel.reviewAssignments.filter((assignment) => assignment.submissionStatus !== SubmissionStatus.Pending)}
        detailAssignmentId={routeParams.assignmentId}
        scoreDrafts={state.scoreDrafts}
        rubricScoreDrafts={state.rubricScoreDrafts}
        rubricCommentDrafts={state.rubricCommentDrafts}
        feedbackDrafts={state.feedbackDrafts}
        annotationDrafts={state.annotationDrafts}
        reviewAttachmentDrafts={state.reviewAttachmentDrafts}
        submittingAssignmentId={state.submittingAssignmentId}
        onScoreChange={(assignmentId, value) => state.setScoreDrafts((current) => ({ ...current, [assignmentId]: value }))}
        onRubricScoreChange={(assignmentId, criterionId, value) =>
          state.setRubricScoreDrafts((current) => ({
            ...current,
            [assignmentId]: { ...(current[assignmentId] ?? {}), [criterionId]: value },
          }))
        }
        onRubricCommentChange={(assignmentId, criterionId, value) =>
          state.setRubricCommentDrafts((current) => ({
            ...current,
            [assignmentId]: { ...(current[assignmentId] ?? {}), [criterionId]: value },
          }))
        }
        onFeedbackChange={(assignmentId, value) => state.setFeedbackDrafts((current) => ({ ...current, [assignmentId]: value }))}
        onAnnotationChange={(assignmentId, value) => state.setAnnotationDrafts((current) => ({ ...current, [assignmentId]: value }))}
        onAttachmentSelect={actions.handleSelectReviewFiles}
        onAttachmentClear={(assignmentId) => state.setReviewAttachmentDrafts((current) => ({ ...current, [assignmentId]: [] }))}
        onSubmit={actions.handleReviewAssignment}
        onExportAll={exportAssignmentSubmissions}
      />
    )
  }

  if (section === 'gradebook') {
    return (
      <TeacherGradebookPanel
        courses={viewModel.teacherCourses}
        gradebookEntries={viewModel.gradebookEntries}
        courseProgressEntries={viewModel.courseProgressEntries}
        assignments={viewModel.reviewAssignments}
        quizzes={viewModel.teacherQuizzes}
        dashboard={dashboard}
        detailCourseId={routeParams.courseId}
        detailQuizId={routeParams.quizId}
        onReviewQuiz={async (quizId, subjectiveScore, feedback) => {
          await dashboardApi.reviewQuiz(quizId, subjectiveScore, feedback)
        }}
      />
    )
  }

  if (section === 'exams') {
    return (
      <ExamManagementPanel
        users={dashboard.users}
        canManageExams={viewModel.currentUser.role === 'teacher' || viewModel.currentUser.role === 'admin'}
      />
    )
  }

  if (section === 'grading') {
    return <ExamGradingPanel users={dashboard.users} />
  }

  if (section === 'discussions') {
    return (
      <TeacherDiscussionPanel
        courses={viewModel.teacherCourses}
        discussions={viewModel.teacherDiscussions}
        currentUserId={viewModel.currentUser.id}
        onModerateTopic={actions.handleModerateTopic}
      />
    )
  }

  return null
}
