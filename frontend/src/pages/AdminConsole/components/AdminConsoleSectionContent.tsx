import type { Dispatch, SetStateAction } from 'react'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import AdminOverview from './panels/OverviewPanel/OverviewPanel'
import AdminOrganizationPanel from './panels/OrganizationPanel/OrganizationPanel'
import AdminOverviewHighlights from './panels/OverviewPanel/components/AdminOverviewHighlights'
import ContentGovernancePanel from './panels/ContentGovernancePanel/ContentGovernancePanel'
import CourseAuditPanel from './panels/CourseAuditPanel/CourseAuditPanel'
import PlatformBusinessPanel from './panels/BusinessPanel/BusinessPanel'
import SystemGovernancePanel from './panels/SystemGovernancePanel/SystemGovernancePanel'
import UserAccessPanel from './panels/UserAccessPanel/UserAccessPanel'
import type { useAdminConsoleActions } from '../hooks/useAdminConsoleActions'
import type { useAdminOrganizationHandlers } from '../hooks/useAdminOrganizationHandlers'
import { auditLabel, roleLabel, roleOptions, statusLabel, type AdminSection } from '../objects/adminConsoleConfig'
import type { buildAdminNavModel } from '../functions/adminConsoleViewModel'

type GovernanceView = 'overview' | 'reports' | 'discussions' | 'discussionDetail'
type OrganizationView = 'overview' | 'enrollments' | 'waitlist' | 'structure' | 'students' | 'courses' | 'logs'

type AdminConsoleRouteParams = {
  courseId?: string
  userId?: string
  discussionId?: string
}

type AdminDraftState = {
  roleDrafts: Record<string, UserRole>
  setRoleDrafts: Dispatch<SetStateAction<Record<string, UserRole>>>
  permissionDrafts: Record<string, string>
  setPermissionDrafts: Dispatch<SetStateAction<Record<string, string>>>
  auditCommentDrafts: Record<string, string>
  setAuditCommentDrafts: Dispatch<SetStateAction<Record<string, string>>>
}

type AdminConsoleSectionContentProps = {
  section: AdminSection
  governanceView: GovernanceView
  organizationView: OrganizationView
  dashboard: EducationDashboardResponse
  dashboardApi: EducationDashboardContextValue
  routeParams: AdminConsoleRouteParams
  adminNavModel: ReturnType<typeof buildAdminNavModel>
  mergedLogs: ReturnType<typeof useAdminConsoleActions>['operationLogs']
  actions: ReturnType<typeof useAdminConsoleActions>
  organizationHandlers: ReturnType<typeof useAdminOrganizationHandlers>
  drafts: AdminDraftState
}

export default function AdminConsoleSectionContent({
  section,
  governanceView,
  organizationView,
  dashboard,
  dashboardApi,
  routeParams,
  adminNavModel,
  mergedLogs,
  actions,
  organizationHandlers,
  drafts,
}: AdminConsoleSectionContentProps) {
  if (section === 'overview') {
    return (
      <>
        <AdminOverview dashboard={dashboard} roleLabel={roleLabel} operationLogs={mergedLogs} />
        <AdminOverviewHighlights
          pendingAuditCount={adminNavModel.pendingAuditCount}
          pendingGovernanceCount={adminNavModel.pendingGovernanceCount}
          adminCount={adminNavModel.adminCount}
        />
      </>
    )
  }

  if (section === 'audits') {
    return (
      <CourseAuditPanel
        courses={dashboard.courses}
        detailCourseId={routeParams.courseId}
        statusLabel={statusLabel}
        auditLabel={auditLabel}
        auditCommentDrafts={drafts.auditCommentDrafts}
        busyKey={actions.busyKey}
        auditLogs={mergedLogs.filter((item) => item.action.includes('课程'))}
        onCommentChange={(courseId, value) => drafts.setAuditCommentDrafts((current) => ({ ...current, [courseId]: value }))}
        onAudit={(courseId, auditStatus) => actions.handleAuditCourse(courseId, auditStatus, drafts.auditCommentDrafts)}
        onToggleStatus={actions.handleToggleCourseStatus}
        onDeleteCourse={actions.handleDeleteCourse}
      />
    )
  }

  if (section === 'users') {
    return (
      <UserAccessPanel
        users={dashboard.users}
        detailUserId={routeParams.userId}
        roleOptions={roleOptions}
        roleLabel={roleLabel}
        roleDrafts={drafts.roleDrafts}
        permissionDrafts={drafts.permissionDrafts}
        busyKey={actions.busyKey}
        operationLogs={mergedLogs.filter((item) => item.action.includes('权限'))}
        onRoleSelect={(userId, role) => drafts.setRoleDrafts((current) => ({ ...current, [userId]: role }))}
        onPermissionChange={(userId, value) => drafts.setPermissionDrafts((current) => ({ ...current, [userId]: value }))}
        onSave={(userId, fallbackRole) => actions.handleUpdateUserAccess(userId, fallbackRole, drafts.roleDrafts, drafts.permissionDrafts)}
      />
    )
  }

  if (section === 'governance') {
    return (
      <ContentGovernancePanel
        discussions={dashboard.discussions}
        reports={dashboard.reports}
        view={governanceView}
        detailDiscussionId={governanceView === 'discussionDetail' ? routeParams.discussionId : undefined}
        busyKey={actions.busyKey}
        governanceLogs={mergedLogs.filter((item) => item.action.includes('内容'))}
        onModerateTopic={actions.handleModerateTopic}
        onResolveReport={async (reportId, status, resolutionNote) => {
          actions.setBusyKey(`report:${reportId}:${status}`)
          try {
            await dashboardApi.resolvePlatformReport(reportId, status, resolutionNote)
            actions.setNotice({
              tone: 'success',
              title: '举报已更新',
              message: '举报工单状态已保存。',
            })
          } catch (error) {
            actions.setNotice({
              tone: 'error',
              title: '处理失败',
              message: error instanceof Error ? error.message : '处理举报时出现未知错误。',
            })
          } finally {
            actions.setBusyKey(null)
          }
        }}
      />
    )
  }

  if (section === 'organization') {
    return (
      <AdminOrganizationPanel
        dashboard={dashboard}
        view={organizationView}
        busyKey={actions.busyKey}
        setNotice={actions.setNotice}
        {...organizationHandlers}
      />
    )
  }

  if (section === 'business') return <PlatformBusinessPanel dashboard={dashboard} />
  if (section === 'system') return <SystemGovernancePanel dashboard={dashboard} />

  return null
}

export type { GovernanceView, OrganizationView }
