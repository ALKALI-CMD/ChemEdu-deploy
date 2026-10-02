import type { KeyboardEvent } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { courseDetailText } from '../hooks/useModuleOutlineState'

type CourseLearningPathMapProps = {
  course: Course
  selectedLessonId?: string
  recentCompletedLessonId?: string | null
  onSelectLesson: (lessonId: string) => void
}

function getLessonTone(lesson: Lesson, active: boolean) {
  if (active) {
    return { fill: '#0ea5e9', stroke: '#0284c7', text: '#ffffff', label: '当前' }
  }
  if (lesson.completed) {
    return { fill: '#10b981', stroke: '#059669', text: '#ffffff', label: '完成' }
  }
  if (lesson.isLocked) {
    return { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e', label: '锁定' }
  }
  if ((lesson.studyRecord?.studyMinutes ?? 0) > 0) {
    return { fill: '#e0f2fe', stroke: '#0ea5e9', text: '#075985', label: '进行' }
  }
  return { fill: '#f8fafc', stroke: '#cbd5e1', text: '#475569', label: '开始' }
}

function onNodeKeyDown(event: KeyboardEvent<SVGGElement>, lessonId: string, onSelectLesson: (lessonId: string) => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onSelectLesson(lessonId)
  }
}

export default function CourseLearningPathMap({ course, selectedLessonId, recentCompletedLessonId, onSelectLesson }: CourseLearningPathMapProps) {
  const moduleHeight = 108
  const width = 920
  const left = 74
  const right = 56
  const top = 46
  const height = Math.max(180, top + course.modules.length * moduleHeight + 24)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">章节学习路径图</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">已完成</span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">进行中</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">待解锁</span>
        </div>
      </div>

      <div className="mt-4 animate-fade-up overflow-x-auto">
        <svg className="min-w-[720px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="课程章节学习路径图">
          {course.modules.map((module, moduleIndex) => {
            const y = top + moduleIndex * moduleHeight
            const lessonCount = Math.max(1, module.lessons.length)
            const availableWidth = width - left - right
            const step = lessonCount > 1 ? availableWidth / (lessonCount - 1) : availableWidth
            const points = module.lessons.map((lesson, lessonIndex) => ({
              lesson,
              x: left + (lessonCount > 1 ? lessonIndex * step : availableWidth / 2),
              y,
            }))
            const completedCount = module.lessons.filter((lesson) => lesson.completed).length

            return (
              <g key={module.id}>
                <text x={left} y={y - 24} className="fill-slate-950 text-[14px] font-semibold">
                  第 {moduleIndex + 1} 章 · {courseDetailText(module.title)}
                </text>
                <text x={width - right} y={y - 24} textAnchor="end" className="fill-slate-500 text-[12px]">
                  {completedCount} / {module.lessons.length} 完成
                </text>
                {points.slice(0, -1).map((point, index) => (
                  <line
                    key={`${point.lesson.id}-line`}
                    x1={point.x + 24}
                    x2={points[index + 1].x - 24}
                    y1={point.y}
                    y2={point.y}
                    className={recentCompletedLessonId === point.lesson.id ? 'lesson-path-advance' : undefined}
                    stroke={point.lesson.completed || recentCompletedLessonId === point.lesson.id ? '#10b981' : '#cbd5e1'}
                    strokeDasharray={point.lesson.completed || recentCompletedLessonId === point.lesson.id ? undefined : '6 6'}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                ))}
                {points.map((point, lessonIndex) => {
                  const active = selectedLessonId === point.lesson.id
                  const recentlyCompleted = recentCompletedLessonId === point.lesson.id
                  const tone = getLessonTone(point.lesson, active)
                  const title = courseDetailText(point.lesson.title)

                  return (
                    <g
                      key={point.lesson.id}
                      role="button"
                      tabIndex={0}
                      className={`svg-node cursor-pointer outline-none ${recentlyCompleted ? 'lesson-node-complete-flash' : ''}`}
                      onClick={() => onSelectLesson(point.lesson.id)}
                      onKeyDown={(event) => onNodeKeyDown(event, point.lesson.id, onSelectLesson)}
                    >
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={recentlyCompleted ? 27 : 24}
                        fill={recentlyCompleted ? '#10b981' : tone.fill}
                        stroke={recentlyCompleted ? '#059669' : tone.stroke}
                        strokeWidth={active || recentlyCompleted ? 4 : 2}
                      />
                      <text x={point.x} y={point.y + 5} textAnchor="middle" className="text-[13px] font-semibold" fill={tone.text}>
                        {lessonIndex + 1}
                      </text>
                      <text x={point.x} y={point.y + 42} textAnchor="middle" className="fill-slate-600 text-[11px]">
                        {title.length > 8 ? `${title.slice(0, 8)}...` : title}
                      </text>
                      <text x={point.x} y={point.y + 58} textAnchor="middle" className="fill-slate-500 text-[10px]">
                        {tone.label}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
