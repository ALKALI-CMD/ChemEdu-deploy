import type { Course } from '@/objects/course/catalog/Course'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import { zh, zhList } from '@/lib/localization'

type CourseMetaPanelProps = {
  course: Course
  enrolled: boolean
  teacherName: string | string
  assistantNames: string
}

const statusLabel: Record<CourseStatus, string> = {
  [CourseStatus.Published]: '已发布',
  [CourseStatus.Draft]: '草稿',
  [CourseStatus.Archived]: '已下架',
}

export default function CourseMetaPanel({ course, enrolled, teacherName, assistantNames }: CourseMetaPanelProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-slate-950">课程信息与教学团队</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-6 text-slate-600">
        <div className="grid gap-3 md:grid-cols-2">
          <p>授课教师：{zh(teacherName)}</p>
          <p>助教团队：{assistantNames || '暂无'}</p>
          <p>学期：{course.semesterLabel || '未设置'}</p>
          <p>开课批次：{course.offeringCode || '未设置'}</p>
          <p>课程状态：{statusLabel[course.status]}</p>
          <p>课程价格：{course.price === 0 ? '免费' : `￥${course.price}`}</p>
          <p>报名状态：{enrolled ? '你已报名本课程' : '当前未报名'}</p>
          <p>报名人数：{course.enrolledCount} / {course.capacity}</p>
          <p>开课时间：{course.startsAt || '未设置'}</p>
          <p>结课时间：{course.endsAt || '未设置'}</p>
          <p>选课开放：{course.enrollmentPolicy.openAt || '未设置'}</p>
          <p>选课截止：{course.enrollmentPolicy.closeAt || '未设置'}</p>
          <p>报名方式：{course.enrollmentPolicy.requiresApproval ? '需审核' : '直接报名'}</p>
          <p>候补名单：{course.enrollmentPolicy.waitlistEnabled ? '开启' : '关闭'}</p>
        </div>

        {course.academicClassIds.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-950">教学班</p>
            <p className="mt-2">{course.academicClassIds.join('、')}</p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-950">章节速览</p>
          <div className="mt-3 space-y-2">
            {course.modules.map((module, index) => (
              <div key={module.id} className="rounded-2xl bg-white px-4 py-3">
                <p className="font-medium text-slate-950">
                  第 {index + 1} 章 · {zh(module.title)}
                </p>
                <p className="text-sm text-slate-500">共 {module.lessons.length} 个课时</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {zhList(course.tags).map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-900">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
