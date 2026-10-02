import { Link } from 'react-router-dom'
import { Button, Card, CardContent } from '@/components/ui/UiComponents'

type ContinueLearningPanelProps = {
  courseId: string
  canManage: boolean
}

export default function ContinueLearningPanel({ courseId, canManage }: ContinueLearningPanelProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <p className="text-lg font-semibold text-slate-950">学习导航</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">第一步</p>
            <p className="mt-1 font-semibold text-slate-950">确认目录与学习位置</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">第二步</p>
            <p className="mt-1 font-semibold text-slate-950">处理作业与测验</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">第三步</p>
            <p className="mt-1 font-semibold text-slate-950">查看课程与团队信息</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
            <Link to={`/course/${courseId}/discussions`}>进入讨论区</Link>
          </Button>
          {canManage ? (
            <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
              <Link to={`/course/${courseId}/manage`}>进入教师管理区</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
