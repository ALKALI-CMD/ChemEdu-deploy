import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { buildQuestionScoreTrend, buildWrongMasteryProgress, questionTypeLabel } from '../functions/quizPanelUtils'

type QuizScoreMasteryPanelsProps = {
  quiz: Quiz
  finishedQuizzes: Quiz[]
}

export default function QuizScoreMasteryPanels({ quiz, finishedQuizzes }: QuizScoreMasteryPanelsProps) {
  const questionScoreTrend = buildQuestionScoreTrend(quiz)
  const wrongMasteryProgress = buildWrongMasteryProgress(quiz, finishedQuizzes)
  const wrongStartQuestionId = quiz.wrongQuestionIds[0]

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">按题得分趋势</p>
          <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">累计 {quiz.score ?? 0}</Badge>
        </div>
        <div className="mt-3 space-y-3">
          {questionScoreTrend.map((point) => (
            <div key={point.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{point.label}</p>
                  <p className="text-sm text-slate-500">{questionTypeLabel[point.questionType]}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>{point.earnedPoints}/{point.totalPoints}</p>
                  <p>累计 {point.cumulative}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">错题掌握进度</p>
          {wrongStartQuestionId ? (
            <Link to={`/student/wrong-book?questionId=${wrongStartQuestionId}`} className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white">
              去错题本重练
            </Link>
          ) : null}
        </div>
        <div className="mt-3 space-y-3">
          {wrongMasteryProgress.length > 0 ? (
            wrongMasteryProgress.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{item.prompt}</p>
                  </div>
                  <Badge
                    className={`rounded-full hover:bg-inherit ${
                      item.masteryLevel === '已掌握'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.masteryLevel === '正在巩固'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.masteryLevel}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">课程维度同类知识点平均正确率 {item.courseAccuracy}%</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">这次测验没有错题，当前不需要错题巩固计划。</div>
          )}
        </div>
      </div>
    </section>
  )
}
