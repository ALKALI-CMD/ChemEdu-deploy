import { Button, Card, CardContent } from '@/components/ui/UiComponents'
import { Link } from 'react-router-dom'

type TeacherOverviewHighlightsProps = {
  pendingReviewCount: number
  pendingDiscussionCount: number
  pendingAuditCount: number
}

export default function TeacherOverviewHighlights({
  pendingReviewCount,
  pendingDiscussionCount,
  pendingAuditCount,
}: TeacherOverviewHighlightsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">首页只看关键入口</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
              <Link to="/teacher/courses">进入课程管理</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
              <Link to="/teacher/publishing">进入作业发布</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
              <Link to="/teacher/discussions">进入讨论管理</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950">当前优先事项</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">待批改作业</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingReviewCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">待治理讨论</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingDiscussionCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">待审核课程</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingAuditCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
