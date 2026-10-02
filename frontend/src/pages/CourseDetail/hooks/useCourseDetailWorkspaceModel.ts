import { useMemo } from 'react'
import { UserRole } from '@/objects/auth/UserRole'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import {
  canManageCourse,
  findCourseForDetail,
  resolveCourseWorkspaceSection,
} from '../functions/courseDetailUtils'

export function useCourseDetailWorkspaceModel(
  dashboard: EducationDashboardResponse,
  view: 'full' | 'discussion' | 'manage',
  courseId?: string,
) {
  const course = findCourseForDetail(dashboard, courseId)
  const canManage = course ? canManageCourse(course, dashboard) : false
  const currentSection = resolveCourseWorkspaceSection(view)
  const relatedAssignments = course ? dashboard.assignments.filter((item) => item.courseId === course.id) : []
  const relatedQuizzes = course ? dashboard.quizzes.filter((item) => item.courseId === course.id) : []
  const relatedReviews = course ? dashboard.courseReviews.filter((item) => item.courseId === course.id) : []
  const enrolled = course
    ? dashboard.enrollments.some(
        (item) => item.userId === dashboard.currentUser.id && item.courseId === course.id && item.status === 'enrolled',
      )
    : false
  const canStudy = dashboard.currentUser.role === UserRole.Student && enrolled
  const canDiscuss = dashboard.currentUser.role === UserRole.Admin || canManage || canStudy
  const relatedDiscussions = course
    ? dashboard.discussions.filter(
        (item) => item.courseId === course.id && (canManage || item.visibility === DiscussionVisibility.Visible),
      )
    : []
  const lessonOptions = useMemo(
    () =>
      course?.modules.flatMap((module, moduleIndex) =>
        module.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id,
          title: `第 ${moduleIndex + 1} 章 · 第 ${lessonIndex + 1} 课时 · ${zh(lesson.title)}`,
        })),
      ) ?? [],
    [course?.modules],
  )
  const discussionCountByLessonId = useMemo(
    () =>
      relatedDiscussions.reduce<Record<string, number>>((acc, discussion) => {
        if (discussion.lessonId) {
          acc[discussion.lessonId] = (acc[discussion.lessonId] ?? 0) + 1
        }
        return acc
      }, {}),
    [relatedDiscussions],
  )
  const teacherName = course ? zh(dashboard.users.find((user) => user.id === course.teacherId)?.name ?? '未分配教师') : ''
  const assistantNames = course
    ? course.assistants
        .map((assistantId) => dashboard.users.find((user) => user.id === assistantId)?.name)
        .filter(Boolean)
        .map(zh)
        .join('、')
    : ''
  const secondaryNav = course
    ? [
        { to: `/course/${course.id}`, label: '课程学习区' },
        { to: `/course/${course.id}/discussions`, label: '课程讨论区' },
        ...(canManage ? [{ to: `/course/${course.id}/manage`, label: '教师管理区' }] : []),
      ]
    : []

  return {
    course,
    canManage,
    currentSection,
    relatedAssignments,
    relatedQuizzes,
    relatedReviews,
    enrolled,
    canStudy,
    canDiscuss,
    relatedDiscussions,
    lessonOptions,
    discussionCountByLessonId,
    teacherName,
    assistantNames,
    secondaryNav,
  }
}
