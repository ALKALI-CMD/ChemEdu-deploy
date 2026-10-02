import type { Lesson } from '@/objects/course/catalog/Lesson'
import { courseDetailText } from '../hooks/useModuleOutlineState'

type CourseOutlineSummaryProps = {
  currentLearningPosition: {
    moduleIndex: number
    lessonIndex: number
    label: string
    moduleTitle: string
    lessonTitle: string
    stateLabel: string
  } | null
  nextLesson?: Lesson | null
  completedLessonCount: number
  totalLessonCount: number
  latestStudiedLesson?: Lesson | null
  recentCompletedLessonId?: string | null
}

export default function CourseOutlineSummary({
  currentLearningPosition,
  nextLesson,
  completedLessonCount,
  totalLessonCount,
  latestStudiedLesson,
  recentCompletedLessonId,
}: CourseOutlineSummaryProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-500">当前学习位置</p>
        {currentLearningPosition ? (
          <>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              第 {currentLearningPosition.moduleIndex + 1} 章 / 第 {currentLearningPosition.lessonIndex + 1} 课时
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {currentLearningPosition.label}：{currentLearningPosition.moduleTitle} / {currentLearningPosition.lessonTitle}
            </p>
            <p className="mt-2 text-xs text-slate-500">当前状态：{currentLearningPosition.stateLabel}</p>
            {nextLesson ? <p className="mt-2 text-xs text-slate-500">下一节：{courseDetailText(nextLesson.title)}</p> : null}
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">暂无课时内容。</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">学习进度摘要</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          {completedLessonCount} / {totalLessonCount} 课时已完成
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-sky-500 transition-all duration-500 ${recentCompletedLessonId ? 'progress-shine lesson-progress-advance' : ''}`}
            style={{ width: `${totalLessonCount === 0 ? 0 : (completedLessonCount / totalLessonCount) * 100}%` }}
          />
        </div>
        {latestStudiedLesson ? <p className="mt-3 text-sm text-slate-600">最近学习：{courseDetailText(latestStudiedLesson.title)}</p> : null}
      </div>
    </div>
  )
}
