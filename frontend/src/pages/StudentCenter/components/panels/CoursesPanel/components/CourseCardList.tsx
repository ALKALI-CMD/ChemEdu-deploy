import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, LogIn, PlayCircle } from 'lucide-react'
import type { Course } from '@/objects/course/catalog/Course'
import { CourseCoverPreview } from '@/components/education/VisualStates'
import { Badge, Button } from '@/components/ui/UiComponents'

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

const signInStorageKey = 'student-course-sign-ins'

type CourseCardListProps = {
  courses: Course[]
  todayCourseIds: Set<string>
}

function readSignIns() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(signInStorageKey) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function CourseCardList({ courses, todayCourseIds }: CourseCardListProps) {
  const [signIns, setSignIns] = useState<Record<string, string>>(() => readSignIns())

  function handleSignIn(courseId: string) {
    setSignIns((current) => {
      const next = { ...current, [courseId]: todayKey() }
      window.localStorage.setItem(signInStorageKey, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => {
        const signedInToday = signIns[String(course.id)] === todayKey()
        const isTodayCourse = todayCourseIds.has(String(course.id))
        const completionRate = Math.max(0, Math.min(100, Number(course.completionRate) || 0))

        return (
          <div
            key={course.id}
            className="flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="w-44 shrink-0 p-4 sm:w-52">
              <CourseCoverPreview course={course} caption="below" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{text(course.title)}</p>
                    <p className="mt-1 text-sm text-slate-600">{text(course.subtitle)}</p>
                  </div>
                  <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
                    完成度 {completionRate}%
                  </Badge>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${completionRate}%` }} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <p>上课时间：{text(course.schedule)}</p>
                  <p>开课时间：{course.startsAt || '以课程通知为准'}</p>
                  <p>分类：{text(course.category)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild className="gap-2 rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
                  <Link className="!text-white" to={`/course/${course.id}`}>
                    <PlayCircle className="size-4" />
                    进入课程
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={signedInToday ? 'gap-2 rounded-full border-emerald-200 bg-emerald-50 text-emerald-800' : 'gap-2 rounded-full bg-white'}
                  onClick={() => handleSignIn(String(course.id))}
                  disabled={!isTodayCourse || signedInToday}
                >
                  {signedInToday ? <CheckCircle2 className="size-4" /> : <LogIn className="size-4" />}
                  {signedInToday ? '今日已签到' : isTodayCourse ? '课程签到' : '非今日课程'}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
