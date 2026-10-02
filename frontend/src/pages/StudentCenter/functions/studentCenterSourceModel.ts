import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { getContinueLearningItem, text } from './studentCenterModelUtils'

export function buildStudentCenterSourceModel(dashboard: EducationDashboardResponse) {
  const currentUser = dashboard.currentUser
  const enrolledCourseIds = new Set(
    dashboard.enrollments.filter((item) => item.userId === currentUser.id).map((item) => item.courseId),
  )
  const enrolledCourses = dashboard.courses.filter(
    (course) => enrolledCourseIds.has(course.id) && course.status === CourseStatus.Published,
  )
  const recommendedCourses = dashboard.courses
    .filter((course) => !enrolledCourseIds.has(course.id) && course.status === CourseStatus.Published)
    .sort((left, right) => Number(right.rating) - Number(left.rating) || right.enrolledCount - left.enrolledCount)
    .slice(0, 3)
  const visibleCourseIds = new Set(enrolledCourses.map((course) => course.id))
  const courseTitleMap = new Map(enrolledCourses.map((course) => [course.id, text(course.title)]))
  const studentAssignments = dashboard.assignments.filter((assignment) => visibleCourseIds.has(assignment.courseId))
  const studentQuizzes = dashboard.quizzes.filter((quiz) => visibleCourseIds.has(quiz.courseId))
  const studentOrders = dashboard.orders.filter((order) => order.buyer === currentUser.name)
  const studentGradebook = dashboard.gradebook.filter((entry) => visibleCourseIds.has(entry.courseId))
  const studentCourseProgress = dashboard.courseProgress.filter((entry) => visibleCourseIds.has(entry.courseId))
  const continueLearning = getContinueLearningItem(enrolledCourses)

  return {
    currentUser,
    enrolledCourses,
    recommendedCourses,
    courseTitleMap,
    studentAssignments,
    studentQuizzes,
    studentOrders,
    studentGradebook,
    studentCourseProgress,
    continueLearning,
  }
}

export type StudentCenterSourceModel = ReturnType<typeof buildStudentCenterSourceModel>
