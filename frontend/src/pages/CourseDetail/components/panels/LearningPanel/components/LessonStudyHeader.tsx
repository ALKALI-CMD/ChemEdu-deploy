import type { Lesson } from '@/objects/course/catalog/Lesson'
import { Badge, CardHeader, CardTitle } from '@/components/ui/UiComponents'

import { formatSeconds, text } from '../functions/lessonStudyUtils'

type LessonStudyHeaderProps = {
  lesson: Lesson
  positionDraft: number
  requiredStudyMinutes: number
  totalTrackedStudyMinutes: number
}

export default function LessonStudyHeader({
  lesson,
  positionDraft,
  requiredStudyMinutes,
  totalTrackedStudyMinutes,
}: LessonStudyHeaderProps) {
  return (
    <CardHeader className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <CardTitle className="text-slate-950">{text(lesson.title)}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{text(lesson.type)}</Badge>
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{text(lesson.duration)}</Badge>
            <Badge
              className={
                lesson.completed
                  ? 'rounded-full bg-slate-950 text-white hover:bg-slate-950'
                  : lesson.isLocked
                    ? 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100'
                    : 'rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100'
              }
            >
              {lesson.completed ? '已完成' : lesson.isLocked ? '未解锁' : '学习中'}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>建议学习时长：{requiredStudyMinutes} 分钟</p>
          <p>累计学习：{totalTrackedStudyMinutes} 分钟</p>
          <p>最近位置：{formatSeconds(positionDraft)}</p>
          <p>最后学习时间：{lesson.studyRecord?.lastStudiedAt ?? '尚未记录'}</p>
        </div>
      </div>
    </CardHeader>
  )
}
