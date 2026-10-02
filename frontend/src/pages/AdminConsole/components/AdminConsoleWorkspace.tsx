import { useState } from 'react'
import EducationShell from '@/components/EducationShell'
import { InlineNotice, useAutoClearNotice } from '@/components/ExperienceState'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import { UserRole } from '@/objects/auth/UserRole'
import type { UserId } from '@/objects/auth/UserId'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import AdminConsoleSectionContent from './AdminConsoleSectionContent'
import { useAdminConsoleActions } from '../hooks/useAdminConsoleActions'
import { useAdminOrganizationHandlers } from '../hooks/useAdminOrganizationHandlers'
import { sectionCopy, type AdminSection } from '../objects/adminConsoleConfig'
import { buildAdminNavModel, buildPersistedCourseLogs } from '../functions/adminConsoleViewModel'

type GovernanceView = 'overview' | 'reports' | 'discussions' | 'discussionDetail'
type OrganizationView = 'overview' | 'enrollments' | 'waitlist' | 'structure' | 'students' | 'courses' | 'logs'

type AdminConsoleRouteParams = {
  courseId?: string
  userId?: string
  discussionId?: string
}

type AdminConsoleWorkspaceProps = {
  section: AdminSection
  governanceView: GovernanceView
  organizationView: OrganizationView
  dashboard: EducationDashboardResponse
  dashboardApi: EducationDashboardContextValue
  routeParams: AdminConsoleRouteParams
}

export default function AdminConsoleWorkspace({
  section,
  governanceView,
  organizationView,
  dashboard,
  dashboardApi,
  routeParams,
}: AdminConsoleWorkspaceProps) {
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({})
  const [permissionDrafts, setPermissionDrafts] = useState<Record<string, string>>({})
  const [auditCommentDrafts, setAuditCommentDrafts] = useState<Record<string, string>>({})
  const currentActor = dashboard.currentUser.name
  const adminNavModel = buildAdminNavModel(dashboard, section)
  const actions = useAdminConsoleActions({
    currentActor,
    courses: dashboard.courses.map((course) => ({
      id: course.id as string,
      title: course.title,
      status: course.status,
      enrolledCount: course.enrolledCount,
    })),
    discussions: dashboard.discussions.map((discussion) => ({
      id: discussion.id,
      title: discussion.title,
      resolved: discussion.resolved,
    })),
    users: dashboard.users.map((user) => ({
      id: user.id as UserId,
      name: user.name,
      permissions: user.permissions,
    })),
    auditCourse: dashboardApi.auditCourse,
    updateCourseStatus: dashboardApi.updateCourseStatus,
    deleteCourse: dashboardApi.deleteCourse,
    updateUserAccess: dashboardApi.updateUserAccess,
    moderateDiscussionTopic: dashboardApi.moderateDiscussionTopic,
  })
  const organizationHandlers = useAdminOrganizationHandlers({
    setBusyKey: actions.setBusyKey,
    saveDepartment: dashboardApi.saveDepartment,
    saveMajor: dashboardApi.saveMajor,
    saveAcademicClass: dashboardApi.saveAcademicClass,
    saveSemester: dashboardApi.saveSemester,
    deleteDepartment: dashboardApi.deleteDepartment,
    deleteMajor: dashboardApi.deleteMajor,
    deleteAcademicClass: dashboardApi.deleteAcademicClass,
    deleteSemester: dashboardApi.deleteSemester,
    assignStudentsToAcademicClass: dashboardApi.assignStudentsToAcademicClass,
    clearStudentsAcademicClass: dashboardApi.clearStudentsAcademicClass,
    updateCourseAcademicClasses: dashboardApi.updateCourseAcademicClasses,
    reviewEnrollment: dashboardApi.reviewEnrollment,
    promoteWaitlistEntry: dashboardApi.promoteWaitlistEntry,
    archiveSemester: dashboardApi.archiveSemester,
  })

  useAutoClearNotice(actions.notice, actions.setNotice)

  const mergedLogs = [...actions.operationLogs, ...buildPersistedCourseLogs(dashboard)].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )

  return (
    <EducationShell
      eyebrow="管理后台"
      title={sectionCopy[section].title}
      description={sectionCopy[section].description}
      secondaryNav={adminNavModel.secondaryNav}
      navCounts={adminNavModel.navCounts}
    >
      <div className="space-y-6">
        <InlineNotice notice={actions.notice} />
        <AdminConsoleSectionContent
          section={section}
          governanceView={governanceView}
          organizationView={organizationView}
          dashboard={dashboard}
          dashboardApi={dashboardApi}
          routeParams={routeParams}
          adminNavModel={adminNavModel}
          mergedLogs={mergedLogs}
          actions={actions}
          organizationHandlers={organizationHandlers}
          drafts={{
            roleDrafts,
            setRoleDrafts,
            permissionDrafts,
            setPermissionDrafts,
            auditCommentDrafts,
            setAuditCommentDrafts,
          }}
        />
      </div>
    </EducationShell>
  )
}

export type { GovernanceView, OrganizationView }
