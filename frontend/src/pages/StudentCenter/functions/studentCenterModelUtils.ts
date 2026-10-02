import type { Course } from '@/objects/course/catalog/Course'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { ContinueLearningItem, TimelineItem } from '../objects/studentCenterTypes'

export function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function parseTimelineTime(value?: string): number {
  if (!value) return Number.MAX_SAFE_INTEGER
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed
}

export function formatGradeFormula(assignmentWeight: number, quizWeight: number, progressWeight: number) {
  return `作业 ${assignmentWeight}% / 测验 ${quizWeight}% / 进度 ${progressWeight}%`
}

export function getAssignmentPriority(assignment: Assignment): number {
  if (assignment.submissionStatus === SubmissionStatus.Pending) return 0
  if (assignment.submissionStatus === SubmissionStatus.Submitted) return 1
  return 3
}

export function getQuizPriority(quiz: Quiz): number {
  if (quiz.status === QuizStatus.Ongoing) return 0
  if (quiz.status === QuizStatus.Upcoming) return 1
  return 3
}

export function getContinueLearningItem(courses: Course[]): ContinueLearningItem | null {
  const rankedCourses = [...courses].sort((left, right) => {
    const leftHasIncomplete = left.modules.some((module) => module.lessons.some((lesson) => !lesson.completed))
    const rightHasIncomplete = right.modules.some((module) => module.lessons.some((lesson) => !lesson.completed))
    if (leftHasIncomplete !== rightHasIncomplete) {
      return leftHasIncomplete ? -1 : 1
    }
    return Number(left.completionRate) - Number(right.completionRate)
  })

  for (const course of rankedCourses) {
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex += 1) {
      const module = course.modules[moduleIndex]
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
        const lesson = module.lessons[lessonIndex]
        if (!lesson.completed) {
          return {
            course,
            moduleIndex,
            lessonIndex,
            lessonId: lesson.id,
            lessonTitle: text(lesson.title),
          }
        }
      }
    }
  }

  const fallbackCourse = rankedCourses[0]
  const fallbackLesson = fallbackCourse?.modules[0]?.lessons[0]
  if (!fallbackCourse || !fallbackLesson) return null

  return {
    course: fallbackCourse,
    moduleIndex: 0,
    lessonIndex: 0,
    lessonId: fallbackLesson.id,
    lessonTitle: text(fallbackLesson.title),
  }
}

export function groupTimelineItems(items: TimelineItem[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay

  return items.reduce<Record<string, TimelineItem[]>>((groups, item) => {
    let label = '更早'
    if (item.sortTime !== Number.MAX_SAFE_INTEGER) {
      const diff = Math.max(0, now - item.sortTime)
      if (diff <= oneDay) {
        label = '今天'
      } else if (diff <= oneWeek) {
        label = '本周'
      }
    } else if (item.category === 'course') {
      label = '继续学习'
    }

    groups[label] ??= []
    groups[label].push(item)
    return groups
  }, {})
}
