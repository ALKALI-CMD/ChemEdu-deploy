import { useState } from 'react'
import type { UserRole } from '@/objects/auth/UserRole'
import type { Course } from '@/objects/course/catalog/Course'
import type { PaymentMethod } from '@/lib/paymentMethods'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import PaymentConfirmDialog from '@/components/PaymentConfirmDialog'
import ReportButton from '@/components/ReportButton'
import { CourseCoverPreview } from '@/components/education/VisualStates'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import { zh } from '@/lib/localization'

type CourseHeroProps = {
  course: Course
  enrolled: boolean
  currentUserId: string
  currentRole: UserRole
  onEnroll: (paymentMethod?: PaymentMethod, inviteCode?: string) => Promise<void>
  onReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

const statusLabel: Record<CourseStatus, string> = {
  [CourseStatus.Published]: '已发布',
  [CourseStatus.Draft]: '草稿',
  [CourseStatus.Archived]: '已下架',
}

const auditLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '审核通过',
  [CourseAuditStatus.Rejected]: '审核驳回',
}

export default function CourseHero({ course, enrolled, currentUserId, currentRole, onEnroll, onReport }: CourseHeroProps) {
  const moduleCount = course.modules.length
  const showAuditStatus = currentRole !== 'student'
  const [showPayment, setShowPayment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleEnroll(paymentMethod?: PaymentMethod, inviteCode?: string) {
    setSubmitting(true)
    try {
      await onEnroll(paymentMethod, inviteCode)
      setShowPayment(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#11315f_40%,#0f766e_100%)] text-white shadow-sm">
      <CardContent className="space-y-6 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">{zh(course.category)}</Badge>
          <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">{zh(course.grade)}</Badge>
          <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">{zh(course.schedule)}</Badge>
          <Badge className="rounded-full border border-sky-300/25 bg-sky-400/10 text-sky-100 hover:bg-sky-400/10">
            {statusLabel[course.status]}
          </Badge>
          {showAuditStatus ? (
            <Badge className="rounded-full border border-emerald-300/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/10">
              {auditLabel[course.auditStatus]}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_320px]">
          <div className="rounded-[24px] border border-white/12 bg-white/10 p-3 backdrop-blur-sm">
            <CourseCoverPreview course={course} caption="below" />
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold tracking-tight text-white">{zh(course.title)}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-slate-200">章节数</p>
                <p className="mt-2 text-xl font-semibold text-white">{moduleCount}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-slate-200">课时数</p>
                <p className="mt-2 text-xl font-semibold text-white">{course.lessonsCount}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-slate-200">报名人数</p>
                <p className="mt-2 text-xl font-semibold text-white">{course.enrolledCount}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-slate-200">课程评分</p>
                <p className="mt-2 text-xl font-semibold text-white">{course.rating}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-slate-200">完成率</p>
                <p className="mt-2 text-xl font-semibold text-white">{course.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-sky-100">课程信息</p>
              <p className="text-2xl font-semibold text-white">报名与学习状态</p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-100">
              <p>查看课程概览、进度和学习信息。</p>
              <p>{enrolled ? '你已经报名这门课程。' : '可以从这里直接报名。'}</p>
            </div>

            {currentRole === 'student' && course.status === CourseStatus.Published ? (
              <div className="flex flex-wrap gap-3">
                {!enrolled ? (
                  <Button
                    className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                    disabled={submitting}
                    onClick={() => {
                      if (course.price > 0) {
                        setShowPayment(true)
                        return
                      }
                      void handleEnroll()
                    }}
                  >
                    {submitting ? '处理中...' : course.price > 0 ? '支付并报名' : '立即报名'}
                  </Button>
                ) : (
                  <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100" disabled>
                    已报名，可继续学习
                  </Button>
                )}
                <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/10">
                  {course.price > 0 ? `课程价格：￥${course.price}` : '免费课程'}
                </Badge>
              </div>
            ) : null}
            <ReportButton
              targetType="course"
              targetId={course.id}
              targetLabel={zh(course.title)}
              label="举报课程"
              className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onSubmit={onReport}
            />
          </div>
        </div>

        {showPayment ? (
          <PaymentConfirmDialog
            course={course}
            userId={currentUserId}
            isOpen={showPayment}
            isSubmitting={submitting}
            onClose={() => setShowPayment(false)}
            onConfirm={handleEnroll}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
