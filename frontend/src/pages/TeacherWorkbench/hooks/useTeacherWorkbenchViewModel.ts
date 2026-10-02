import { UserRole } from '@/objects/auth/UserRole'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

export function useTeacherWorkbenchViewModel(
  dashboard: EducationDashboardResponse,
  selectedCourseId: string | null,
  courseFormMode: 'edit' | 'create',
) {
  const currentUser = dashboard.currentUser
  const canManage = currentUser.role === UserRole.Teacher || currentUser.role === UserRole.Admin
  const canDirectPublishCourse = currentUser.role === UserRole.Admin
  const teacherCourses = dashboard.courses.filter((course) =>
    currentUser.role === UserRole.Admin ? true : course.teacherId === currentUser.id,
  )
  const selectedCourse = selectedCourseId ? teacherCourses.find((course) => course.id === selectedCourseId) ?? null : null
  const editingCourse = courseFormMode === 'edit' ? selectedCourse ?? undefined : undefined
  const defaultTeacherId = dashboard.users.find((user) => user.role === UserRole.Teacher)?.id
  const teacherCourseIds = new Set(teacherCourses.map((course) => course.id))
  const reviewAssignments = dashboard.assignments.filter((assignment) => teacherCourseIds.has(assignment.courseId))
  const gradebookEntries = dashboard.gradebook.filter((entry) => teacherCourseIds.has(entry.courseId))
  const courseProgressEntries = dashboard.courseProgress.filter((entry) => teacherCourseIds.has(entry.courseId))
  const teacherQuizzes = dashboard.quizzes.filter((quiz) => teacherCourseIds.has(quiz.courseId))
  const teacherDiscussions = dashboard.discussions.filter((discussion) => teacherCourseIds.has(discussion.courseId))
  const pendingReviewCount = reviewAssignments.filter(
    (assignment) => assignment.submissionStatus === SubmissionStatus.Submitted,
  ).length
  const pendingDiscussionCount = teacherDiscussions.filter(
    (discussion) =>
      discussion.visibility === DiscussionVisibility.Hidden ||
      discussion.threadState === DiscussionThreadState.Locked,
  ).length
  const pendingAuditCount = teacherCourses.filter(
    (course) => course.auditStatus === CourseAuditStatus.Pending && course.status !== CourseStatus.Published,
  ).length

  return {
    currentUser,
    canManage,
    canDirectPublishCourse,
    teacherCourses,
    selectedCourse,
    editingCourse,
    defaultTeacherId,
    reviewAssignments,
    gradebookEntries,
    courseProgressEntries,
    teacherQuizzes,
    teacherDiscussions,
    pendingReviewCount,
    pendingDiscussionCount,
    pendingAuditCount,
    navCounts: {
      '/teacher/reviews': pendingReviewCount,
      '/teacher/discussions': pendingDiscussionCount,
    },
  }
}
