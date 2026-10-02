import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import ManagePanel from './panels/ManagePanel/ManagePanel'
import type { useCourseDetailActions } from '../hooks/useCourseDetailActions'
import type { useCourseDetailWorkspaceModel } from '../hooks/useCourseDetailWorkspaceModel'

type CourseManageSectionProps = {
  dashboard: EducationDashboardResponse
  model: ReturnType<typeof useCourseDetailWorkspaceModel>
  courseActions: ReturnType<typeof useCourseDetailActions>
}

export default function CourseManageSection({ dashboard, model, courseActions }: CourseManageSectionProps) {
  if (!model.course) {
    return null
  }

  return (
    <ManagePanel
      canManage={model.canManage}
      course={model.course}
      enrolled={model.enrolled}
      teacherName={model.teacherName}
      assistantNames={model.assistantNames}
      teachingInsights={dashboard.teachingInsights}
      users={dashboard.users}
      onSaveCourse={courseActions.handleSaveCourse}
      onUpdateCourseStatus={(status) => courseActions.handleUpdateCourseStatus(model.course!.id, status)}
    />
  )
}
