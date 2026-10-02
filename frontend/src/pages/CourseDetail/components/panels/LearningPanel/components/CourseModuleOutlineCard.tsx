import { CheckCircle2, Lock, MessageSquareText, PlayCircle, RotateCcw } from 'lucide-react'
import type { Course } from '@/objects/course/catalog/Course'
import { Badge, Button } from '@/components/ui/UiComponents'
import { courseDetailText } from '../hooks/useModuleOutlineState'
import { findLessonTitleById, lessonStatusBadgeClass, lessonStatusLabel } from '../functions/courseOutlineModel'

type CourseModuleOutlineCardProps = {
  course: Course
  module: Course['modules'][number]
  moduleIndex: number
  isOpen: boolean
  canStudy: boolean
  focusLessonId?: string
  selectedLessonId?: string
  recentCompletedLessonId?: string | null
  discussionCountByLessonId: Record<string, number>
  onToggleModule: (moduleId: string) => void
  onSelectLesson: (lessonId: string) => void
  onToggleLessonProgress: (lessonId: string, completed: boolean) => Promise<void>
  onOpenLessonDiscussion?: (lessonId: string) => void
}

export default function CourseModuleOutlineCard({
  course,
  module,
  moduleIndex,
  isOpen,
  canStudy,
  focusLessonId,
  selectedLessonId,
  recentCompletedLessonId,
  discussionCountByLessonId,
  onToggleModule,
  onSelectLesson,
  onToggleLessonProgress,
  onOpenLessonDiscussion,
}: CourseModuleOutlineCardProps) {
  const completedLessons = module.lessons.filter((lesson) => lesson.completed).length

  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            第 {moduleIndex + 1} 章 / {courseDetailText(module.title)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {completedLessons} / {module.lessons.length} 课时已完成
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-white text-slate-700">
            {module.lessons.length} 个课时
          </Badge>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onToggleModule(String(module.id))}>
            {isOpen ? '收起章节' : '展开章节'}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-3">
          {module.lessons.map((lesson, lessonIndex) => {
            const studyMinutes = lesson.studyRecord?.studyMinutes ?? 0
            const active = focusLessonId === lesson.id || selectedLessonId === lesson.id
            const recentlyCompleted = recentCompletedLessonId === lesson.id
            const prerequisiteTitle = findLessonTitleById(course, lesson.unlockAfterLessonId)
            const meetsStudyRequirement = studyMinutes >= lesson.requiredStudyMinutes
            const canMarkComplete = !lesson.isLocked && (lesson.completed || !lesson.videoUrl || meetsStudyRequirement)
            const discussionCount = discussionCountByLessonId[lesson.id] ?? 0

            return (
              <div
                key={lesson.id}
                id={`lesson-${lesson.id}`}
                className={`surface-hover rounded-2xl bg-white px-4 py-3 transition ${
                  active ? 'ring-2 ring-sky-300 shadow-sm' : ''
                } ${recentlyCompleted ? 'lesson-complete-flash' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-950">
                      课时 {lessonIndex + 1} / {courseDetailText(lesson.title)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {courseDetailText(lesson.type)} / {courseDetailText(lesson.duration)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={lesson.completed ? 'default' : 'secondary'} className={lessonStatusBadgeClass(lesson)}>
                      {lesson.isLocked ? <Lock className="size-3" /> : null}
                      {lessonStatusLabel(lesson)}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                      学习 {studyMinutes} / {lesson.requiredStudyMinutes} 分钟
                    </Badge>
                    <Button
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      className={`rounded-full gap-2 ${active ? 'bg-slate-950 text-white hover:bg-slate-800' : ''}`}
                      onClick={() => onSelectLesson(lesson.id)}
                    >
                      <PlayCircle className="size-4" />
                      进入学习区
                    </Button>
                    {onOpenLessonDiscussion ? (
                      <Button type="button" variant="outline" className="rounded-full gap-2" onClick={() => onOpenLessonDiscussion(lesson.id)}>
                        <MessageSquareText className="size-4" />
                        {discussionCount > 0 ? `讨论 ${discussionCount}` : '发起讨论'}
                      </Button>
                    ) : null}
                    {canStudy ? (
                      <Button
                        type="button"
                        variant={lesson.completed ? 'outline' : 'default'}
                        className={`rounded-full gap-2 ${
                          lesson.completed ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                        onClick={() => void onToggleLessonProgress(lesson.id, lesson.completed)}
                        disabled={!canMarkComplete}
                      >
                        {lesson.completed ? <RotateCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
                        {lesson.completed ? '标记为未完成' : '标记完成'}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="space-y-2">
                    {lesson.contentBlocks.slice(0, 2).map((block) => (
                      <div key={block.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="font-medium text-slate-900">{courseDetailText(block.title)}</p>
                        <p className="mt-1 line-clamp-2 leading-6 text-slate-600">{courseDetailText(block.content)}</p>
                      </div>
                    ))}
                    {lesson.isLocked && prerequisiteTitle ? (
                      <p className="text-xs text-amber-700">需要先完成前置课时《{prerequisiteTitle}》。</p>
                    ) : null}
                    {!lesson.completed && !lesson.isLocked && lesson.videoUrl && !meetsStudyRequirement ? (
                      <p className="text-xs text-slate-500">
                        还需学习 {Math.max(0, lesson.requiredStudyMinutes - studyMinutes)} 分钟。
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lesson.videoUrl ? <Badge className="rounded-full bg-white text-slate-700">视频</Badge> : null}
                    {lesson.documentUrl ? <Badge className="rounded-full bg-white text-slate-700">课件</Badge> : null}
                    {lesson.resourceAttachments.length > 0 ? (
                      <Badge className="rounded-full bg-white text-slate-700">资料 {lesson.resourceAttachments.length}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
