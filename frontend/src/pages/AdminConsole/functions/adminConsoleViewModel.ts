import { UserRole } from '@/objects/auth/UserRole'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import type { AdminSection } from '../objects/adminConsoleConfig'
import { governanceSecondaryNav, organizationSecondaryNav } from './adminConsoleNavigation'

export function buildAdminNavModel(dashboard: EducationDashboardResponse, section: AdminSection) {
  const pendingAuditCount = dashboard.courses.filter(
    (course) => course.auditStatus === CourseAuditStatus.Pending && course.status !== CourseStatus.Published,
  ).length
  const moderatedDiscussionCount = dashboard.discussions.filter(
    (discussion) =>
      discussion.visibility === DiscussionVisibility.Hidden || discussion.threadState === DiscussionThreadState.Locked,
  ).length
  const activeReportCount = dashboard.reports.filter((report) => report.status === 'open' || report.status === 'reviewing').length
  const pendingGovernanceCount = moderatedDiscussionCount + activeReportCount
  const pendingEnrollmentCount = dashboard.enrollments.filter((enrollment) => enrollment.status === 'pending').length

  return {
    activeReportCount,
    adminCount: dashboard.users.filter((user) => user.role === UserRole.Admin).length,
    moderatedDiscussionCount,
    pendingAuditCount,
    pendingEnrollmentCount,
    pendingGovernanceCount,
    navCounts: {
      '/admin/audits': pendingAuditCount,
      '/admin/governance': pendingGovernanceCount,
      '/admin/governance/reports': activeReportCount,
      '/admin/governance/discussions': moderatedDiscussionCount,
      '/admin/organization': pendingEnrollmentCount + dashboard.waitlistEntries.length,
      '/admin/organization/enrollments': pendingEnrollmentCount,
      '/admin/organization/waitlist': dashboard.waitlistEntries.length,
    },
    secondaryNav:
      section === 'governance' ? governanceSecondaryNav : section === 'organization' ? organizationSecondaryNav : [],
  }
}

export function buildPersistedCourseLogs(dashboard: EducationDashboardResponse) {
  return dashboard.courses
    .filter((course) => course.auditedBy || course.auditedAt || course.auditComment)
    .map((course) => ({
      id: `course-log-${course.id}`,
      actor: course.auditedBy ?? '系统',
      action: '课程审核',
      target: `课程：${course.title}`,
      detail: course.auditComment ? `审核意见：${course.auditComment}` : undefined,
      createdAt: course.auditedAt ?? '历史记录',
    }))
}
