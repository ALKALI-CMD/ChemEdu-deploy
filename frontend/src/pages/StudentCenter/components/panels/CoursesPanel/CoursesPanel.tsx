import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'
import type { Course } from '@/objects/course/catalog/Course'
import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import CourseCardList from './components/CourseCardList'
import CourseProgressStrip from './components/CourseProgressStrip'
import CourseQuickActions from './components/CourseQuickActions'

type EnrolledCoursesPanelProps = {
  courses: Course[]
}

function parseCourseStart(course: Course) {
  const candidates = [course.startsAt, String(course.schedule)]
  for (const value of candidates) {
    if (!value) continue
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) return new Date(parsed)
  }
  return null
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

function getTodayCourses(courses: Course[]) {
  const today = new Date()
  const matched = courses.filter((course) => {
    const start = parseCourseStart(course)
    if (start && isSameDay(start, today)) return true
    const schedule = String(course.schedule)
    return schedule.includes('今日') || schedule.includes('今天')
  })

  return matched.length > 0 ? matched : courses.slice(0, Math.min(1, courses.length))
}

export default function EnrolledCoursesPanel({ courses }: EnrolledCoursesPanelProps) {
  const todayCourses = useMemo(() => getTodayCourses(courses), [courses])

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-slate-950">我的课程</CardTitle>
          {courses.length > 0 ? (
            <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
              {courses.length} 门课程
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length > 0 ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-sky-700 shadow-sm">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">今日课程 {todayCourses.length} 门</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {todayCourses.map((course) => `${String(course.title)} / ${String(course.schedule)}`).join('；')}
                  </p>
                </div>
              </div>
              <Badge className="rounded-full bg-white text-sky-800 hover:bg-white">课程卡片可签到</Badge>
            </div>
          </div>
        ) : null}

        {courses.length === 0 ? (
          <EmptyIllustrationState
            kind="courses"
            title="暂无报名课程"
            message="暂无课程。"
          />
        ) : (
          <>
            <CourseProgressStrip courses={courses} />
            <CourseCardList
              courses={courses}
              todayCourseIds={new Set(todayCourses.map((course) => String(course.id)))}
            />
          </>
        )}
        <CourseQuickActions />
      </CardContent>
    </Card>
  )
}
