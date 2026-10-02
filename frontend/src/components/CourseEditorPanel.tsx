import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { UserId } from '@/objects/auth/UserId'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import CourseEditorStepSwitcher from '@/components/course-editor/CourseEditorStepSwitcher'
import {
  cloneEmptyLesson,
  cloneEmptyModule,
  normalizeLessonType,
  toInput,
} from '@/components/course-editor/courseEditorOptions'
import BasicSettingsStep from '@/components/course-editor/steps/BasicSettingsStep'
import PublishSettingsStep from '@/components/course-editor/steps/PublishSettingsStep'
import StructureSettingsStep from '@/components/course-editor/steps/StructureSettingsStep'
import { useCourseEditorModel } from '@/components/course-editor/useCourseEditorModel'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '保存失败，请稍后重试。'
}

type CourseEditorFieldErrors = Partial<Record<'title' | 'category' | 'grade' | 'schedule' | 'price' | 'description' | 'modules', string>>

export default function CourseEditorPanel({
  assistantUsers = [],
  course,
  title,
  actionLabel,
  allowDirectPublish = true,
  onSubmit,
}: {
  assistantUsers?: UserProfile[]
  course?: Course
  title: string
  actionLabel: string
  allowDirectPublish?: boolean
  onSubmit: (input: CourseEditorInput) => Promise<void>
}) {
  const initialInput = useMemo(() => toInput(course), [course])
  const [fieldErrors, setFieldErrors] = useState<CourseEditorFieldErrors>({})
  const {
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
    updateLessonField: updateLessonFieldValue,
    updateLesson,
    addModule: appendModule,
    removeModule,
    moveModule,
    addLesson: appendLesson,
    removeLesson,
    moveLesson,
    toggleAssistant: toggleAssistantSelection,
  } = useCourseEditorModel({
    initialInput,
    allowDirectPublish,
    createEmptyModule: cloneEmptyModule,
    normalizeLessonType,
  })

  function handleUpdateLessonField(
    moduleIndex: number,
    lessonIndex: number,
    field: 'title' | 'duration' | 'type',
    value: string,
  ) {
    updateLessonFieldValue(moduleIndex, lessonIndex, field, value)
  }

  function handleAddModule() {
    appendModule()
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
        })),
      })),
    }))
  }

  function handleAddLesson(moduleIndex: number) {
    appendLesson(moduleIndex, cloneEmptyLesson)
  }

  function handleToggleAssistant(assistantId: UserId) {
    toggleAssistantSelection(assistantId)
  }

  function handleUpdateModuleTitle(moduleIndex: number, titleValue: string) {
    updateModuleTitle(moduleIndex, titleValue.trim())
  }

  function validateForm() {
    const nextErrors: CourseEditorFieldErrors = {}
    if (!form.title.trim()) {
      nextErrors.title = '课程标题为必填项。'
    }
    if (!form.category.trim()) {
      nextErrors.category = '请选择课程分类。'
    }
    if (!form.grade.trim()) {
      nextErrors.grade = '请选择适用年级。'
    }
    if (!form.schedule.trim()) {
      nextErrors.schedule = '请选择上课时间。'
    }
    if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      nextErrors.price = '课程价格必须为 0 或正数。'
    }
    if (!form.description.trim()) {
      nextErrors.description = '课程简介为必填项，请说明课程目标、内容和适合人群。'
    }
    if (form.modules.length === 0) {
      nextErrors.modules = '请至少保留一个章节。'
    }
    if (form.modules.some((module) => module.lessons.length === 0)) {
      nextErrors.modules = '每个章节至少需要一个课时。'
    }
    if (form.modules.some((module) => !module.title.trim())) {
      nextErrors.modules = '章节标题不能为空。'
    }
    if (form.modules.some((module) => module.lessons.some((lesson) => !lesson.title.trim() || !lesson.duration.trim()))) {
      nextErrors.modules = '每个课时都需要填写课时标题和时长。'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      throw new Error('保存失败：请根据输入框下方的提示修改后再提交。')
    }
  }

  async function submitForm(statusOverride?: CourseStatus) {
    setSaving(true)
    setError(null)
    setSuccessHint(null)
    setFieldErrors({})

    try {
      validateForm()
      const nextInput: CourseEditorInput = {
        ...form,
        status: statusOverride ?? form.status,
      }

      const normalizedStatus =
        allowDirectPublish || nextInput.status !== CourseStatus.Published ? nextInput.status : CourseStatus.Draft

      await onSubmit({
        ...nextInput,
        status: normalizedStatus,
      })

      setSuccessHint(
        normalizedStatus === CourseStatus.Published
          ? '课程已进入发布流程。可前往课程管理查看状态，或进入作业发布页面配置学习任务。'
          : '课程已保存。可继续编辑章节课时，或前往发布设置查看审核与上架状态。',
      )
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitForm()
  }

  return (
    <Card className="border-white/60 bg-white/90">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-slate-100 text-slate-900 hover:bg-slate-100">
              已完成步骤 {completedStepCount} / 3
            </Badge>
            <Badge className="rounded-full bg-white text-slate-900 hover:bg-white">
              {dirty ? '有未保存修改' : '当前已保存'}
            </Badge>
          </div>
        </div>

        <CourseEditorStepSwitcher step={step} setStep={setStep} completionMap={completionMap} />
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {step === 'basic' ? <BasicSettingsStep title={title} form={form} setForm={setForm} fieldErrors={fieldErrors} /> : null}
          {step === 'structure' ? (
            <StructureSettingsStep
              form={form}
              totalLessons={totalLessons}
              updateModuleTitle={handleUpdateModuleTitle}
              handleUpdateLessonField={handleUpdateLessonField}
              updateLesson={updateLesson}
              handleAddModule={handleAddModule}
              handleAddLesson={handleAddLesson}
              removeModule={removeModule}
              moveModule={moveModule}
              removeLesson={removeLesson}
              moveLesson={moveLesson}
              fieldError={fieldErrors.modules}
            />
          ) : null}
          {step === 'publish' ? (
            <PublishSettingsStep
              title={title}
              form={form}
              setForm={setForm}
              assistantUsers={assistantUsers}
              allowDirectPublish={allowDirectPublish}
              totalLessons={totalLessons}
              handleToggleAssistant={handleToggleAssistant}
            />
          ) : null}

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
              {error}
            </div>
          ) : null}
          {successHint ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              {successHint}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setStep((current) =>
                    current === 'publish' ? 'structure' : current === 'structure' ? 'basic' : 'basic',
                  )
                }
                disabled={step === 'basic'}
              >
                上一步
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setStep((current) =>
                    current === 'basic' ? 'structure' : current === 'structure' ? 'publish' : 'publish',
                  )
                }
                disabled={step === 'publish'}
              >
                后续操作
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => void submitForm(CourseStatus.Draft)}
                disabled={saving}
              >
                保存草稿
              </Button>
            </div>

            <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800" disabled={saving}>
              {saving ? '保存中...' : actionLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
