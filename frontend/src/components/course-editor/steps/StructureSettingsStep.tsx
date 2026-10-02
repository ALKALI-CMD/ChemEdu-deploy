import { LessonContentType } from '@/objects/course/catalog/LessonContentType'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { CourseLessonInput } from '@/objects/course/catalog/CourseLessonInput'
import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import { Button, Input, Label, Textarea } from '@/components/ui/UiComponents'
import { lessonTypeOptions } from '@/components/course-editor/courseEditorOptions'

type StructureSettingsStepProps = {
  form: CourseEditorInput
  totalLessons: number
  updateModuleTitle: (moduleIndex: number, titleValue: string) => void
  handleUpdateLessonField: (
    moduleIndex: number,
    lessonIndex: number,
    field: 'title' | 'duration' | 'type',
    value: string,
  ) => void
  updateLesson: (
    moduleIndex: number,
    lessonIndex: number,
    updater: (lesson: CourseLessonInput) => CourseLessonInput,
  ) => void
  handleAddModule: () => void
  handleAddLesson: (moduleIndex: number) => void
  removeModule: (moduleIndex: number) => void
  moveModule: (moduleIndex: number, direction: -1 | 1) => void
  removeLesson: (moduleIndex: number, lessonIndex: number) => void
  moveLesson: (moduleIndex: number, lessonIndex: number, direction: -1 | 1) => void
  fieldError?: string
}

export default function StructureSettingsStep({
  form,
  totalLessons,
  updateModuleTitle,
  handleUpdateLessonField,
  updateLesson,
  handleAddModule,
  handleAddLesson,
  removeModule,
  moveModule,
  removeLesson,
  moveLesson,
  fieldError,
}: StructureSettingsStepProps) {
  const parseAttachmentLabels = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((label) => ({
        label: label.trim(),
        url: '',
        attachmentType: AssignmentAttachmentType.Reference,
        uploadedAt: undefined,
        sizeBytes: undefined,
      }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">章节与课时（必填）</p>
          <p className="text-sm text-slate-500">
            当前共 {form.modules.length} 个章节，{totalLessons} 个课时。每个章节至少需要 1 个课时。
          </p>
          {fieldError ? <p className="mt-2 text-sm leading-6 text-red-600">{fieldError}</p> : null}
        </div>
        <Button
          type="button"
          className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
          onClick={handleAddModule}
        >
          新增章节
        </Button>
      </div>

      {form.modules.map((module, moduleIndex) => (
        <div key={`${module.id ?? 'new'}-${moduleIndex}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              required
              aria-required="true"
              placeholder="章节标题（必填）"
              value={module.title}
              onChange={(event) => updateModuleTitle(moduleIndex, event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => moveModule(moduleIndex, -1)}
                disabled={moduleIndex === 0}
              >
                上移
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => moveModule(moduleIndex, 1)}
                disabled={moduleIndex === form.modules.length - 1}
              >
                下移
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                onClick={() => removeModule(moduleIndex)}
                disabled={form.modules.length === 1}
              >
                删除章节
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {module.lessons.map((lesson, lessonIndex) => (
              <div key={`${lesson.id ?? 'new'}-${lessonIndex}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    required
                    aria-required="true"
                    placeholder="课时标题（必填）"
                    value={lesson.title}
                    onChange={(event) => handleUpdateLessonField(moduleIndex, lessonIndex, 'title', event.target.value)}
                  />
                  <Input
                    required
                    aria-required="true"
                    placeholder="时长（必填）"
                    value={lesson.duration}
                    onChange={(event) => handleUpdateLessonField(moduleIndex, lessonIndex, 'duration', event.target.value)}
                  />
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={lesson.type}
                    onChange={(event) => handleUpdateLessonField(moduleIndex, lessonIndex, 'type', event.target.value)}
                  >
                    {lessonTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>视频地址（选填）</Label>
                    <Input
                      placeholder="https://..."
                      value={lesson.videoUrl ?? ''}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          videoUrl: event.target.value.trim() ? event.target.value.trim() : undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>课件地址（选填）</Label>
                    <Input
                      placeholder="https://..."
                      value={lesson.documentUrl ?? ''}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          documentUrl: event.target.value.trim() ? event.target.value.trim() : undefined,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>资料名称（选填）</Label>
                    <Input
                      placeholder="讲义.pdf, 示例代码.zip"
                      value={lesson.resourceAttachments.map((item) => item.label).join(', ')}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          resourceAttachments: parseAttachmentLabels(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>解锁前置课时 ID（选填）</Label>
                    <Input
                      placeholder="可留空"
                      value={lesson.unlockAfterLessonId ?? ''}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          unlockAfterLessonId: event.target.value.trim() ? event.target.value.trim() : undefined,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>要求学习分钟数（必填）</Label>
                    <Input
                      required
                      aria-required="true"
                      type="number"
                      min={1}
                      value={lesson.requiredStudyMinutes}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          requiredStudyMinutes: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>课时正文（选填）</Label>
                    <Textarea
                      className="min-h-24 bg-white"
                      placeholder="填写本课时富文本正文"
                      value={lesson.contentBlocks.find((block) => block.contentType === LessonContentType.RichText)?.content ?? ''}
                      onChange={(event) =>
                        updateLesson(moduleIndex, lessonIndex, (current) => ({
                          ...current,
                          contentBlocks: [
                            {
                              id: current.contentBlocks.find((block) => block.contentType === LessonContentType.RichText)?.id ?? `lesson-${lessonIndex + 1}-body`,
                              contentType: LessonContentType.RichText,
                              title: '正文',
                              content: event.target.value,
                            },
                            ...current.contentBlocks.filter((block) => block.contentType !== LessonContentType.RichText),
                          ],
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => moveLesson(moduleIndex, lessonIndex, -1)}
                    disabled={lessonIndex === 0}
                  >
                    课时上移
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => moveLesson(moduleIndex, lessonIndex, 1)}
                    disabled={lessonIndex === module.lessons.length - 1}
                  >
                    课时下移
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                    disabled={module.lessons.length === 1}
                  >
                    删除课时
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => handleAddLesson(moduleIndex)}
            >
              为当前章节新增课时
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
