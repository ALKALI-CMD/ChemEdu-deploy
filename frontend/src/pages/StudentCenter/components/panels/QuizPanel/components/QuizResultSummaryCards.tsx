import type { Quiz } from '@/objects/course/learning/Quiz'
import { getObjectiveSummary, type CoursePerformanceCard } from '../functions/quizPanelUtils'

type QuizResultSummaryCardsProps = {
  quiz: Quiz
  coursePerformance: CoursePerformanceCard[]
}

export default function QuizResultSummaryCards({ quiz, coursePerformance }: QuizResultSummaryCardsProps) {
  const objectiveSummary = getObjectiveSummary(quiz)
  const courseAverageScore = coursePerformance.find((item) => item.courseId === quiz.courseId)?.averageScore ?? quiz.score ?? 0

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">总分</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{quiz.score ?? 0}</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">客观题正确率</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">
          {objectiveSummary.accuracy !== undefined ? `${objectiveSummary.accuracy}%` : '暂无'}
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">错题数量</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{quiz.wrongQuestionIds.length}</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">课程累计表现</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">{courseAverageScore}</p>
      </div>
    </div>
  )
}
