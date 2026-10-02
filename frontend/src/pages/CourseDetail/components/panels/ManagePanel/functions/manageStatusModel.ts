import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'

export const auditStatusLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '已通过',
  [CourseAuditStatus.Rejected]: '已驳回',
}

export const courseStatusLabel: Record<CourseStatus, string> = {
  [CourseStatus.Draft]: '草稿',
  [CourseStatus.Published]: '已发布',
  [CourseStatus.Archived]: '已归档',
}

export type ManageDrilldownKey = 'risk' | 'bottleneck' | 'distribution'

export function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function buildLessonLink(courseId: string, lessonId: string) {
  return `/course/${courseId}?lesson=${lessonId}`
}

export function buildCourseManageInsightModel(course: Course, teachingInsights: TeachingInsightSnapshot) {
  return {
    atRiskStudents: teachingInsights.atRiskStudents.filter((item) => item.courseId === course.id),
    bottlenecks: teachingInsights.lessonBottlenecks.filter((item) => item.courseId === course.id),
    distribution: teachingInsights.completionDistributions.find((item) => item.courseId === course.id),
  }
}
