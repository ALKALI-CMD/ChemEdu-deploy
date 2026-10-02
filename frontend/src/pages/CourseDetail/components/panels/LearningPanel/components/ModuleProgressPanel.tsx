import { useEffect, useMemo, useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import CourseOutlinePanel from './CourseOutlinePanel'
import LessonStudyWorkspace from './LessonStudyWorkspace'

type ModuleProgressPanelProps = {
  course: Course
  canStudy: boolean
  focusLessonId?: string
  discussionCountByLessonId?: Record<string, number>
  onToggleLessonProgress: (lessonId: string, completed: boolean) => Promise<void>
  onRecordLessonStudy: (
    lessonId: string,
    completed: boolean,
    studyMinutes: number,
    lastPositionSeconds?: number,
    options?: { silent?: boolean },
  ) => Promise<void>
  onOpenLessonDiscussion?: (lessonId: string) => void
}

function findInitialLesson(course: Course, focusLessonId?: string) {
  if (focusLessonId) {
    const focused = course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === focusLessonId)
    if (focused) {
      return focused.id
    }
  }

  const firstIncomplete = course.modules.flatMap((module) => module.lessons).find((lesson) => !lesson.completed && !lesson.isLocked)
  if (firstIncomplete) {
    return firstIncomplete.id
  }

  return course.modules.flatMap((module) => module.lessons)[0]?.id
}

export default function ModuleProgressPanel({
  course,
  canStudy,
  focusLessonId,
  discussionCountByLessonId,
  onToggleLessonProgress,
  onRecordLessonStudy,
  onOpenLessonDiscussion,
}: ModuleProgressPanelProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(() => findInitialLesson(course, focusLessonId))
  const [recentCompletedLessonId, setRecentCompletedLessonId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedLessonId(findInitialLesson(course, focusLessonId))
  }, [course, focusLessonId])

  const selectedLesson = useMemo(
    () => course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === selectedLessonId) ?? null,
    [course.modules, selectedLessonId],
  )

  async function handleSelectLesson(lessonId: string) {
    setSelectedLessonId(String(lessonId))
    const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.id === lessonId)
    if (!lesson || !canStudy) {
      return
    }
    await onRecordLessonStudy(
      lessonId,
      lesson.completed,
      0,
      lesson.studyRecord?.lastPositionSeconds ?? 0,
      { silent: true },
    )
  }

  async function handleToggleLessonProgress(lessonId: string, completed: boolean) {
    const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.id === lessonId)
    if (!completed) {
      setRecentCompletedLessonId(String(lessonId))
      window.setTimeout(() => setRecentCompletedLessonId((current) => (current === String(lessonId) ? null : current)), 1400)
    }

    if (lesson && !completed && !lesson.videoUrl) {
      const recordedStudyMinutes = lesson.studyRecord?.studyMinutes ?? 0
      const requiredStudyMinutes = lesson.requiredStudyMinutes ?? 0
      await onRecordLessonStudy(
        lessonId,
        true,
        Math.max(0, requiredStudyMinutes - recordedStudyMinutes),
        lesson.studyRecord?.lastPositionSeconds ?? 0,
      )
      return
    }

    await onToggleLessonProgress(lessonId, completed)
  }

  return (
    <div className="space-y-4">
      <CourseOutlinePanel
        course={course}
        canStudy={canStudy}
        focusLessonId={focusLessonId}
        selectedLessonId={selectedLessonId}
        recentCompletedLessonId={recentCompletedLessonId}
        discussionCountByLessonId={discussionCountByLessonId}
        onSelectLesson={(lessonId) => void handleSelectLesson(lessonId)}
        onToggleLessonProgress={handleToggleLessonProgress}
        onOpenLessonDiscussion={onOpenLessonDiscussion}
      />
      <LessonStudyWorkspace
        lesson={selectedLesson}
        canStudy={canStudy}
        onRecordLessonStudy={onRecordLessonStudy}
      />
    </div>
  )
}
