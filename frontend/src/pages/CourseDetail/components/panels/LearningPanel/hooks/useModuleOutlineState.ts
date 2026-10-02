import { useEffect, useMemo, useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import type { Lesson } from '@/objects/course/catalog/Lesson'

function storageKey(courseId: string) {
  return `course-open-modules:${courseId}`
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function buildInitialOpenModules(course: Course, focusLessonId?: string) {
  const focusModule = focusLessonId
    ? course.modules.find((module) => module.lessons.some((lesson) => lesson.id === focusLessonId))
    : undefined
  const firstIncompleteModule = course.modules.find((module) => module.lessons.some((lesson) => !lesson.completed))
  const firstModule = course.modules[0]

  return new Set(
    [focusModule?.id, firstIncompleteModule?.id, firstModule?.id]
      .filter((value): value is NonNullable<typeof value> => Boolean(value))
      .map((value) => String(value)),
  )
}

function findLatestStudiedLesson(course: Course) {
  const lessons = course.modules.flatMap((module) => module.lessons)
  return lessons
    .filter((lesson) => lesson.studyRecord?.lastStudiedAt)
    .sort((left, right) => {
      const leftValue = Date.parse(left.studyRecord?.lastStudiedAt ?? '')
      const rightValue = Date.parse(right.studyRecord?.lastStudiedAt ?? '')
      return Number.isNaN(rightValue) ? -1 : Number.isNaN(leftValue) ? 1 : rightValue - leftValue
    })[0]
}

function findNextUnlockedLesson(course: Course) {
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      if (!lesson.completed && !lesson.isLocked) {
        return lesson
      }
    }
  }
  return null
}

function findLessonLocation(course: Course, lessonId?: string) {
  if (!lessonId) {
    return null
  }

  for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex += 1) {
    const module = course.modules[moduleIndex]
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
      const lesson = module.lessons[lessonIndex]
      if (lesson.id === lessonId) {
        return {
          module,
          lesson,
          moduleIndex,
          lessonIndex,
        }
      }
    }
  }

  return null
}

function formatStudyState(lesson: Lesson) {
  if (lesson.completed) {
    return '已完成'
  }
  if (lesson.isLocked) {
    return '待解锁'
  }
  if ((lesson.studyRecord?.studyMinutes ?? 0) > 0) {
    return '继续学习'
  }
  return '准备开始'
}

export function useModuleOutlineState(course: Course, focusLessonId?: string) {
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(() => {
    const defaults = buildInitialOpenModules(course, focusLessonId)
    if (typeof window === 'undefined') {
      return defaults
    }

    const saved = window.localStorage.getItem(storageKey(String(course.id)))
    if (!saved) {
      return defaults
    }

    try {
      const parsed = JSON.parse(saved) as string[]
      return new Set(parsed)
    } catch {
      return defaults
    }
  })

  useEffect(() => {
    const defaults = buildInitialOpenModules(course, focusLessonId)
    if (typeof window === 'undefined') {
      setOpenModuleIds(defaults)
      return
    }

    const saved = window.localStorage.getItem(storageKey(String(course.id)))
    if (!saved) {
      setOpenModuleIds(defaults)
      return
    }

    try {
      const parsed = JSON.parse(saved) as string[]
      const next = new Set(parsed)
      if (focusLessonId) {
        const focusModuleId = course.modules.find((module) => module.lessons.some((lesson) => lesson.id === focusLessonId))?.id
        if (focusModuleId) {
          next.add(String(focusModuleId))
        }
      }
      setOpenModuleIds(next)
    } catch {
      setOpenModuleIds(defaults)
    }
  }, [course, focusLessonId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(storageKey(String(course.id)), JSON.stringify([...openModuleIds]))
  }, [course.id, openModuleIds])

  useEffect(() => {
    if (!focusLessonId) {
      return
    }

    const timer = window.setTimeout(() => {
      document.getElementById(`lesson-${focusLessonId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [focusLessonId])

  const totalLessonCount = useMemo(
    () => course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [course.modules],
  )

  const completedLessonCount = useMemo(
    () =>
      course.modules.reduce((sum, module) => sum + module.lessons.filter((lesson) => lesson.completed).length, 0),
    [course.modules],
  )

  const latestStudiedLesson = useMemo(() => findLatestStudiedLesson(course), [course])
  const nextLesson = useMemo(() => findNextUnlockedLesson(course), [course])

  const currentLearningPosition = useMemo(() => {
    const focused = findLessonLocation(course, focusLessonId)
    if (focused) {
      return {
        moduleIndex: focused.moduleIndex,
        lessonIndex: focused.lessonIndex,
        moduleTitle: text(focused.module.title),
        lessonTitle: text(focused.lesson.title),
        label: '当前定位',
        stateLabel: formatStudyState(focused.lesson),
      }
    }

    const latest = findLessonLocation(course, latestStudiedLesson?.id)
    if (latest) {
      return {
        moduleIndex: latest.moduleIndex,
        lessonIndex: latest.lessonIndex,
        moduleTitle: text(latest.module.title),
        lessonTitle: text(latest.lesson.title),
        label: '最近学习到',
        stateLabel: formatStudyState(latest.lesson),
      }
    }

    const unlocked = findLessonLocation(course, nextLesson?.id)
    if (unlocked) {
      return {
        moduleIndex: unlocked.moduleIndex,
        lessonIndex: unlocked.lessonIndex,
        moduleTitle: text(unlocked.module.title),
        lessonTitle: text(unlocked.lesson.title),
        label: '下一节建议学习',
        stateLabel: formatStudyState(unlocked.lesson),
      }
    }

    const lastModule = course.modules.at(-1)
    const lastLesson = lastModule?.lessons.at(-1)
    if (!lastModule || !lastLesson) {
      return null
    }

    return {
      moduleIndex: course.modules.length - 1,
      lessonIndex: lastModule.lessons.length - 1,
      moduleTitle: text(lastModule.title),
      lessonTitle: text(lastLesson.title),
      label: '已完成全部课时',
      stateLabel: '已完成',
    }
  }, [course, focusLessonId, latestStudiedLesson, nextLesson])

  function toggleModule(moduleId: string) {
    setOpenModuleIds((current) => {
      const next = new Set(current)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  return {
    openModuleIds,
    totalLessonCount,
    completedLessonCount,
    currentLearningPosition,
    latestStudiedLesson,
    nextLesson,
    toggleModule,
  }
}

export function courseDetailText(value: unknown) {
  return text(value)
}
