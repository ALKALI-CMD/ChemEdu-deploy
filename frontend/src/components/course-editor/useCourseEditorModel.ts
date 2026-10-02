import { useEffect, useMemo, useState } from 'react'
import type { UserId } from '@/objects/auth/UserId'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { CourseLessonInput } from '@/objects/course/catalog/CourseLessonInput'
import type { CourseModuleInput } from '@/objects/course/catalog/CourseModuleInput'

type EditorStep = 'basic' | 'structure' | 'publish'

export function useCourseEditorModel({
  initialInput,
  allowDirectPublish,
  createEmptyModule,
  normalizeLessonType,
}: {
  initialInput: CourseEditorInput
  allowDirectPublish: boolean
  createEmptyModule: (order: number) => CourseModuleInput
  normalizeLessonType: (value: string) => CourseLessonInput['type']
}) {
  const [form, setForm] = useState<CourseEditorInput>(initialInput)
  const [step, setStep] = useState<EditorStep>('basic')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successHint, setSuccessHint] = useState<string | null>(null)

  useEffect(() => {
    setForm(initialInput)
    setStep('basic')
    setError(null)
    setSuccessHint(null)
  }, [initialInput])

  useEffect(() => {
    if (!allowDirectPublish && form.status === CourseStatus.Published) {
      setForm((prev) => ({ ...prev, status: CourseStatus.Draft }))
    }
  }, [allowDirectPublish, form.status])

  const totalLessons = useMemo(
    () => form.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [form.modules],
  )

  const basicComplete = Boolean(form.title && form.category && form.grade && form.schedule && form.description)
  const structureComplete =
    form.modules.length > 0 &&
    form.modules.every(
      (module) =>
        Boolean(module.title.trim()) &&
        module.lessons.length > 0 &&
        module.lessons.every((lesson) => Boolean(lesson.title.trim()) && Boolean(lesson.duration.trim())),
    )
  const publishComplete = Boolean(form.tags.length > 0 || form.assistants.length > 0 || Number(form.price) >= 0)

  const completionMap: Record<EditorStep, boolean> = {
    basic: basicComplete,
    structure: structureComplete,
    publish: publishComplete,
  }

  const completedStepCount = Object.values(completionMap).filter(Boolean).length
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialInput), [form, initialInput])

  useEffect(() => {
    if (!dirty) return undefined

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  function updateModule(moduleIndex: number, updater: (module: CourseModuleInput) => CourseModuleInput) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((module, index) => (index === moduleIndex ? updater(module) : module)),
    }))
  }

  function updateModuleTitle(moduleIndex: number, title: CourseModuleInput['title']) {
    updateModule(moduleIndex, (module) => ({ ...module, title }))
  }

  function updateLessonField(
    moduleIndex: number,
    lessonIndex: number,
    field: 'title' | 'duration' | 'type',
    value: string,
  ) {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson, childIndex) =>
        childIndex === lessonIndex
          ? {
              ...lesson,
              [field]: field === 'type' ? normalizeLessonType(value) : value,
            }
          : lesson,
      ),
    }))
  }

  function updateLesson(moduleIndex: number, lessonIndex: number, updater: (lesson: CourseLessonInput) => CourseLessonInput) {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson, childIndex) => (childIndex === lessonIndex ? updater(lesson) : lesson)),
    }))
  }

  function addModule() {
    setForm((prev) => ({
      ...prev,
      modules: [...prev.modules, createEmptyModule(prev.modules.length + 1)],
    }))
  }

  function removeModule(moduleIndex: number) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex),
    }))
  }

  function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
      return items
    }

    const nextItems = [...items]
    const [target] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, target)
    return nextItems
  }

  function moveModule(moduleIndex: number, direction: -1 | 1) {
    setForm((prev) => ({
      ...prev,
      modules: moveItem(prev.modules, moduleIndex, moduleIndex + direction),
    }))
  }

  function addLesson(moduleIndex: number, createEmptyLesson: (order: number) => CourseLessonInput) {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: [...module.lessons, createEmptyLesson(module.lessons.length + 1)],
    }))
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: module.lessons.filter((_, index) => index !== lessonIndex),
    }))
  }

  function moveLesson(moduleIndex: number, lessonIndex: number, direction: -1 | 1) {
    updateModule(moduleIndex, (module) => ({
      ...module,
      lessons: moveItem(module.lessons, lessonIndex, lessonIndex + direction),
    }))
  }

  function toggleAssistant(assistantId: UserId) {
    setForm((prev) => ({
      ...prev,
      assistants: prev.assistants.includes(assistantId)
        ? prev.assistants.filter((item) => item !== assistantId)
        : [...prev.assistants, assistantId],
    }))
  }

  return {
    form,
    setForm,
    step,
    setStep,
    saving,
    setSaving,
    error,
    setError,
    successHint,
    setSuccessHint,
    totalLessons,
    completionMap,
    completedStepCount,
    dirty,
    updateModuleTitle,
    updateLessonField,
    updateLesson,
    addModule,
    removeModule,
    moveModule,
    addLesson,
    removeLesson,
    moveLesson,
    toggleAssistant,
  }
}

export type { EditorStep }
