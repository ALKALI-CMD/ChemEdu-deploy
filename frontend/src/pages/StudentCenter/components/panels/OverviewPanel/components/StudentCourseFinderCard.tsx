import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'

type StudentCourseFinderCardProps = {
  recommendedCourses: Course[]
  teacherNameById: Map<string, string>
}

export default function StudentCourseFinderCard({
  recommendedCourses,
  teacherNameById,
}: StudentCourseFinderCardProps) {
  const [showCourseFinder, setShowCourseFinder] = useState(false)
  const [courseKeyword, setCourseKeyword] = useState('')
  const filteredRecommendedCourses = useMemo(() => {
    const keyword = courseKeyword.trim().toLowerCase()

    return recommendedCourses
      .filter((course) => {
        if (!keyword) return true

        const teacherName = teacherNameById.get(String(course.teacherId)) ?? ''
        const searchable = [
          course.title,
          course.subtitle,
          course.category,
          course.schedule,
          course.grade,
          course.semesterLabel,
          course.offeringCode,
          teacherName,
        ]
          .map((item) => String(item ?? '').toLowerCase())
          .join(' ')

        return searchable.includes(keyword)
      })
      .sort((first, second) => {
        const firstScore = Number(first.rating ?? 0) * 10 + Number(first.enrolledCount ?? 0) / 10
        const secondScore = Number(second.rating ?? 0) * 10 + Number(second.enrolledCount ?? 0) / 10
        return secondScore - firstScore
      })
  }, [courseKeyword, recommendedCourses, teacherNameById])

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-950">购买 / 加入新课程</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white"
              onClick={() => setShowCourseFinder((current) => !current)}
            >
              {showCourseFinder ? '收起添加课程' : '添加新课程'}
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/courses">浏览全部课程</Link>
            </Button>
          </div>
        </div>
        {showCourseFinder ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="bg-white pl-9"
                placeholder="搜索课程名、教师、上课时间、年级"
                value={courseKeyword}
                onChange={(event) => setCourseKeyword(event.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {filteredRecommendedCourses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 md:col-span-3">
                  没有匹配的可加入课程。
                </div>
              ) : (
                filteredRecommendedCourses.map((course) => {
                  const teacherName = teacherNameById.get(String(course.teacherId)) ?? '未分配教师'

                  return (
                    <div key={course.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{String(course.title)}</p>
                          <p className="mt-1 text-sm text-slate-500">{teacherName} / {String(course.schedule)}</p>
                        </div>
                        <Badge className="rounded-full bg-amber-50 text-amber-800 hover:bg-amber-50">{Number(course.rating).toFixed(1)} 分</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{String(course.category)} / {String(course.grade || '全年级')}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{String(course.subtitle)}</p>
                      <Button asChild variant="outline" className="mt-4 rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
                        <Link to={`/course/${course.id}`}>查看并加入</Link>
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
