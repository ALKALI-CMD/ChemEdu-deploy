import { UserRole } from '@/objects/auth/UserRole'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

export type CourseWorkspaceSection = 'learn' | 'discussion' | 'manage'

export function getCourseDetailDescription(role: UserRole, section: CourseWorkspaceSection): string {
  if (section === 'discussion') {
    return '课程讨论。'
  }

  if (section === 'manage') {
    return '课程管理。'
  }

  if (role === UserRole.Student) {
    return '课程学习。'
  }

  if (role === UserRole.Teacher || role === UserRole.Assistant) {
    return '课程详情。'
  }

  return '课程详情。'
}

export function resolveCourseWorkspaceSection(view: 'full' | 'discussion' | 'manage'): CourseWorkspaceSection {
  return view === 'discussion' ? 'discussion' : view === 'manage' ? 'manage' : 'learn'
}

export function findCourseForDetail(dashboard: EducationDashboardResponse, courseId?: string): Course | undefined {
  const requestedCourse = dashboard.courses.find((item) => item.id === courseId)
  const fallbackCourse =
    dashboard.currentUser.role === UserRole.Student
      ? dashboard.courses.find((item) => item.status === CourseStatus.Published)
      : dashboard.courses[0]

  return requestedCourse ?? fallbackCourse
}

export function canManageCourse(course: Course, dashboard: EducationDashboardResponse): boolean {
  const isCourseAssistant = course.assistants.includes(dashboard.currentUser.id)
  return (
    dashboard.currentUser.role === UserRole.Admin ||
    (dashboard.currentUser.role === UserRole.Teacher && dashboard.currentUser.id === course.teacherId) ||
    isCourseAssistant
  )
}

export function canStudentViewCourse(course: Course, dashboard: EducationDashboardResponse, canManage: boolean): boolean {
  return dashboard.currentUser.role !== UserRole.Student || canManage || course.status === CourseStatus.Published
}
