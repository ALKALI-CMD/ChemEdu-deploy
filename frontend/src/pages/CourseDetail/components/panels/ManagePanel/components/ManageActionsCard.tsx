import { Link } from 'react-router-dom'
import type { Course } from '@/objects/course/catalog/Course'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { Button, Card, CardContent } from '@/components/ui/UiComponents'

type ManageActionsCardProps = {
  course: Course
  onToggleStatus: () => void
}

export default function ManageActionsCard({ course, onToggleStatus }: ManageActionsCardProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">发布与审核动作</p>
          <p className="text-sm leading-6 text-slate-600">处理课程状态与讨论入口。</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={onToggleStatus}>
            {course.status === CourseStatus.Published ? '下架课程' : '申请发布 / 发布课程'}
          </Button>
          <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
            <Link to={`/course/${course.id}/discussions`}>查看课程讨论区</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
