import { Link } from 'react-router-dom'
import EducationPageGuard from '@/components/EducationPageGuard'
import EducationShell from '@/components/EducationShell'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export default function AssistantCenter() {
  return (
    <EducationPageGuard title="课程助教" description="查看你接受邀请后获得助教权限的课程。" loadingVariant="teacher">
      {(dashboard) => {
        const assistedCourses = dashboard.courses.filter((course) => course.assistants.includes(dashboard.currentUser.id))
        const teacherNameById = new Map(dashboard.users.map((user) => [String(user.id), String(user.name)]))

        return (
          <EducationShell eyebrow="课程内角色" title="课程助教" description="助教权限只跟随具体课程，不再作为单独主身份。">
            <div className="space-y-6">
              {assistedCourses.length === 0 ? (
                <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-slate-950">你不是任何课程的助教</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {assistedCourses.map((course) => (
                    <Card key={course.id} className="border-slate-200 bg-white text-slate-900 shadow-sm">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-slate-950">{text(course.title)}</p>
                            <p className="mt-1 text-sm text-slate-500">主讲教师：{teacherNameById.get(String(course.teacherId)) ?? '未分配教师'}</p>
                          </div>
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
                            本课程助教
                          </Badge>
                        </div>
                        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                          <p>上课时间：{text(course.schedule)}</p>
                          <p>报名人数：{course.enrolledCount}</p>
                          <p>课程状态：{text(course.status)}</p>
                          <p>审核状态：{text(course.auditStatus)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
                            <Link className="!text-white" to={`/course/${course.id}/manage`}>进入助教工作区</Link>
                          </Button>
                          <Button asChild variant="outline" className="rounded-full">
                            <Link to={`/course/${course.id}/discussions`}>查看讨论</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </EducationShell>
        )
      }}
    </EducationPageGuard>
  )
}
