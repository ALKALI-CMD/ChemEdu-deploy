import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEnrollment } from '@/objects/course/enrollment/CourseEnrollment'

type EnrollmentReviewPanelProps = {
  enrollments: CourseEnrollment[]
  courseMap: Map<string, Course>
  userMap: Map<string, UserProfile>
  busyKey: string | null
  onReviewEnrollment: (courseId: Course['id'], userId: string, approved: boolean) => void
}

export default function EnrollmentReviewPanel({
  enrollments,
  courseMap,
  userMap,
  busyKey,
  onReviewEnrollment,
}: EnrollmentReviewPanelProps) {
  return (
    <div className="grid gap-6">
      <Card className="border-slate-200 bg-white shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle>选课审核</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {enrollments.length === 0 ? (
            <p>当前没有待审核报名。</p>
          ) : (
            enrollments.map((enrollment) => {
              const course = courseMap.get(String(enrollment.courseId))
              const user = userMap.get(String(enrollment.userId))
              const busy = busyKey === `org:enrollment:${enrollment.courseId}:${enrollment.userId}`

              return (
                <div key={`${enrollment.courseId}-${enrollment.userId}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{course?.title ?? enrollment.courseId}</p>
                      <p className="mt-1">{user?.name ?? enrollment.userId} / {enrollment.enrolledAt}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" disabled={busy} onClick={() => onReviewEnrollment(enrollment.courseId, String(enrollment.userId), true)}>
                        通过
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => onReviewEnrollment(enrollment.courseId, String(enrollment.userId), false)}>
                        驳回
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
