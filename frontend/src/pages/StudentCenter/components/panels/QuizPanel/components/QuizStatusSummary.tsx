import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { Card, CardContent } from '@/components/ui/UiComponents'

export default function QuizStatusSummary({ quizzes }: { quizzes: Quiz[] }) {
  const summary = {
    upcoming: quizzes.filter((item) => item.status === QuizStatus.Upcoming).length,
    ongoing: quizzes.filter((item) => item.status === QuizStatus.Ongoing).length,
    finished: quizzes.filter((item) => item.status === QuizStatus.Finished).length,
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-amber-200 bg-amber-50 text-slate-900 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-amber-700">即将开始</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.upcoming}</p>
        </CardContent>
      </Card>
      <Card className="border-sky-200 bg-sky-50 text-slate-900 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-sky-700">进行中</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.ongoing}</p>
        </CardContent>
      </Card>
      <Card className="border-emerald-200 bg-emerald-50 text-slate-900 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-emerald-700">已结束</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.finished}</p>
        </CardContent>
      </Card>
    </div>
  )
}
