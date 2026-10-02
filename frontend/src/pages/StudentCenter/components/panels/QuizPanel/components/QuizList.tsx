import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { getQuizTimeWindow, quizStatusLabel } from '../functions/quizPanelUtils'

type QuizListProps = {
  quizzes: Quiz[]
}

export default function QuizList({ quizzes }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
        暂无测验。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <Link
          key={quiz.id}
          to={`/student/quizzes/${quiz.id}`}
          className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 transition hover:border-slate-300 hover:bg-white"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{quiz.title}</p>
              <p className="mt-1 text-sm text-slate-500">{getQuizTimeWindow(quiz)}</p>
            </div>
            <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{quizStatusLabel[quiz.status]}</Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
            <span>时长 {quiz.durationMinutes} 分钟</span>
            <span>客观题 {quiz.objectiveQuestionCount}</span>
            <span>主观题 {quiz.subjectiveQuestionCount}</span>
            <span>分数 {quiz.score ?? '未提交'}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
