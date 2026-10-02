import type { Course } from '@/objects/course/catalog/Course'

export default function CourseProgressStrip({ courses }: { courses: Course[] }) {
  const averageProgress =
    courses.length === 0
      ? 0
      : Math.round(courses.reduce((sum, course) => sum + Number(course.completionRate), 0) / courses.length)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">课程平均进度</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{averageProgress}%</p>
        </div>
        <p className="rounded-full bg-white px-3 py-1 text-sm text-slate-600">{courses.length} 门课程</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${averageProgress}%` }} />
      </div>
    </div>
  )
}
