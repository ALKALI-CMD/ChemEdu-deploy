import EducationShell from '@/components/EducationShell'
import { InlineNotice, useAutoClearNotice } from '@/components/ExperienceState'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import TeacherWorkbenchSectionContent from './TeacherWorkbenchSectionContent'
import { useTeacherWorkbenchActions } from '../hooks/useTeacherWorkbenchActions'
import { useTeacherWorkbenchState } from '../hooks/useTeacherWorkbenchState'
import { useTeacherWorkbenchViewModel } from '../hooks/useTeacherWorkbenchViewModel'
import { sectionCopy, type TeacherWorkbenchSection } from '../objects/teacherWorkbenchConfig'

type TeacherWorkbenchRouteParams = {
  courseId?: string
  assignmentId?: string
  quizId?: string
}

type TeacherWorkbenchWorkspaceProps = {
  section: TeacherWorkbenchSection
  dashboard: EducationDashboardResponse
  dashboardApi: EducationDashboardContextValue
  routeParams: TeacherWorkbenchRouteParams
}

export default function TeacherWorkbenchWorkspace({
  section,
  dashboard,
  dashboardApi,
  routeParams,
}: TeacherWorkbenchWorkspaceProps) {
  const state = useTeacherWorkbenchState()
  const routeCourseId = section === 'courses' ? routeParams.courseId : undefined
  const effectiveCourseFormMode = routeCourseId === 'new' ? 'create' : state.courseFormMode
  const effectiveSelectedCourseId = routeCourseId && routeCourseId !== 'new' ? routeCourseId : state.selectedCourseId
  const viewModel = useTeacherWorkbenchViewModel(dashboard, effectiveSelectedCourseId, effectiveCourseFormMode)
  const actions = useTeacherWorkbenchActions({
    dashboardApi,
    currentUser: viewModel.currentUser,
    defaultTeacherId: viewModel.defaultTeacherId,
    canDirectPublishCourse: viewModel.canDirectPublishCourse,
    assignmentsById: new Map(viewModel.reviewAssignments.map((assignment) => [assignment.id, assignment])),
    scoreDrafts: state.scoreDrafts,
    rubricScoreDrafts: state.rubricScoreDrafts,
    rubricCommentDrafts: state.rubricCommentDrafts,
    feedbackDrafts: state.feedbackDrafts,
    annotationDrafts: state.annotationDrafts,
    setReviewAttachmentDrafts: state.setReviewAttachmentDrafts,
    setSubmittingAssignmentId: state.setSubmittingAssignmentId,
    setPublishingLearningTask: state.setPublishingLearningTask,
    setSelectedCourseIds: state.setSelectedCourseIds,
  })

  useAutoClearNotice(actions.notice, actions.setNotice)

  return (
    <EducationShell
      eyebrow="教师后台"
      title={sectionCopy[section].title}
      description={sectionCopy[section].description}
      navCounts={viewModel.navCounts}
    >
      <div className="space-y-6">
        <InlineNotice notice={actions.notice} />
        <TeacherWorkbenchSectionContent
          section={section}
          dashboard={dashboard}
          dashboardApi={dashboardApi}
          routeParams={routeParams}
          effectiveSelectedCourseId={effectiveSelectedCourseId}
          effectiveCourseFormMode={effectiveCourseFormMode}
          state={state}
          viewModel={viewModel}
          actions={actions}
        />
      </div>
    </EducationShell>
  )
}
