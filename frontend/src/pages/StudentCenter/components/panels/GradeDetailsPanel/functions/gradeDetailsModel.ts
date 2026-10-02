import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { GradeDetailItem } from '../../../../hooks/useStudentCenterModel'

export function categoryLabel(category: GradeDetailItem['category']) {
  switch (category) {
    case 'course':
      return '课程总评'
    case 'assignment':
      return '作业'
    case 'quiz':
      return '测验'
  }
}

export function scoreTone(score?: number) {
  if (score === undefined) return 'bg-slate-100 text-slate-700'
  if (score >= 90) return 'bg-emerald-100 text-emerald-900'
  if (score >= 75) return 'bg-sky-100 text-sky-900'
  if (score >= 60) return 'bg-amber-100 text-amber-900'
  return 'bg-rose-100 text-rose-900'
}

export function buildCourseGradeCards({
  gradebook,
  courseProgress,
  gradeDetails,
}: {
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
  gradeDetails: GradeDetailItem[]
}) {
  const courseIds = Array.from(new Set([...gradebook.map((entry) => entry.courseId), ...gradeDetails.map((item) => item.courseId)]))

  return courseIds.map((courseId) => {
    const grade = gradebook.find((entry) => entry.courseId === courseId)
    const progress = courseProgress.find((entry) => entry.courseId === courseId)
    const details = gradeDetails.filter((item) => item.courseId === courseId && item.category !== 'course')
    const assignments = details.filter((item) => item.category === 'assignment')
    const quizzes = details.filter((item) => item.category === 'quiz')
    const title = grade?.courseTitle ?? details[0]?.courseTitle ?? String(courseId)

    return {
      courseId,
      title,
      grade,
      progress,
      assignments,
      quizzes,
    }
  })
}
