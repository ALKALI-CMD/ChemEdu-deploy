import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Star, Users } from 'lucide-react'
import { ActionPanel, InfoTile } from '@/components/education/DisplayPrimitives'
import { CourseCoverPreview } from '@/components/education/VisualStates'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import { UserRole } from '@/objects/auth/UserRole'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import { courseDiscoveryText, courseStatusLabel, getCoursePriceLabel, getCourseStatusTone } from '../../../../objects/courseDiscoveryConfig'

type CourseCardProps = {
  course: Course
  currentRole: UserRole
  enrolled: boolean
  teacherName: string
  pending: boolean
  onEnroll: (course: Course) => Promise<void>
}

export default function CourseCard({
  course,
  currentRole,
  enrolled,
  teacherName,
  pending,
  onEnroll,
}: CourseCardProps) {
  const courseId = String(course.id)
  const price = Number(course.price)
  const completionRate = Math.round(Number(course.completionRate))
  const enrollmentRatio = course.capacity > 0 ? course.enrolledCount / course.capacity : 0

  return (
    <Card className="motion-card animate-fade-up overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-[176px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-4">
            <CourseCoverPreview course={course} caption="below" />
          </div>
          <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={`rounded-full border ${getCourseStatusTone(course.status)}`}>{courseStatusLabel[course.status]}</Badge>
              <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
                {courseDiscoveryText(course.category)}
              </Badge>
              {price === 0 ? (
                <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                  免费
                </Badge>
              ) : null}
              {enrolled ? (
                <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-50">
                  已加入 · {completionRate}%
                </Badge>
              ) : null}
              {enrollmentRatio >= 0.8 ? (
                <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                  高人气
                </Badge>
              ) : null}
            </div>
            <div className="space-y-1 rounded-2xl bg-white/95 p-3 shadow-sm">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">{courseDiscoveryText(course.title)}</h3>
              <p className="text-sm leading-6 text-slate-600">{courseDiscoveryText(course.subtitle)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">价格</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{getCoursePriceLabel(price)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <InfoTile label="授课教师" value={teacherName} />
          <InfoTile label="课时数" value={`${course.lessonsCount} 节`} icon={<Clock3 className="h-4 w-4 text-slate-500" />} />
          <InfoTile label="报名人数" value={`${course.enrolledCount} / ${course.capacity}`} icon={<Users className="h-4 w-4 text-slate-500" />} />
          <InfoTile label="课程评分" value={Number(course.rating).toFixed(1)} icon={<Star className="h-4 w-4 text-amber-500" />} />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {course.semesterLabel ? <span>学期：{course.semesterLabel}</span> : null}
            {course.offeringCode ? <span>批次：{course.offeringCode}</span> : null}
            <span>报名：{course.enrollmentPolicy.requiresApproval ? '需审核' : '直接报名'}</span>
            {course.enrollmentPolicy.waitlistEnabled ? <span>支持候补</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {course.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                {courseDiscoveryText(tag)}
              </Badge>
            ))}
          </div>
          {enrolled ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>学习完成度</span>
                <span>{completionRate}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="progress-shine h-full rounded-full bg-violet-500 transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          ) : null}
        </div>

        <ActionPanel
          title="操作"
          description=""
          actions={
            <>
              <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
                <Link to={`/course/${courseId}`}>
                  查看详情
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {currentRole === UserRole.Student && course.status === CourseStatus.Published ? (
                enrolled ? (
                  <Button asChild className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
                    <Link to={`/course/${courseId}`} className="!text-white">
                      进入学习
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                    onClick={() => void onEnroll(course)}
                    disabled={pending}
                  >
                    {pending ? '报名中...' : price > 0 ? '立即报名' : '免费报名'}
                  </Button>
                )
              ) : null}
            </>
          }
        />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
