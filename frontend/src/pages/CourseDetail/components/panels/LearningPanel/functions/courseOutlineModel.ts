import type { Course } from '@/objects/course/catalog/Course'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { courseDetailText } from '../hooks/useModuleOutlineState'

export function lessonStatusLabel(lesson: Lesson) {
  if (lesson.isLocked) return '未解锁'
  if (lesson.completed) return '已完成'
  if ((lesson.studyRecord?.studyMinutes ?? 0) > 0) return '进行中'
  return '未开始'
}

export function lessonStatusBadgeClass(lesson: Lesson) {
  if (lesson.completed) return 'rounded-full bg-emerald-600 text-white hover:bg-emerald-600'
  if (lesson.isLocked) return 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100'
  if ((lesson.studyRecord?.studyMinutes ?? 0) > 0) return 'rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100'
  return 'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100'
}

export function findLessonTitleById(course: Course, lessonId?: string) {
  if (!lessonId) return null
  for (const module of course.modules) {
    const matched = module.lessons.find((lesson) => lesson.id === lessonId)
    if (matched) return courseDetailText(matched.title)
  }
  return lessonId
}
