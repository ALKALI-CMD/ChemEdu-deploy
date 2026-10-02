import { ChartPanel, ScoreTrendChart, type ScoreTrendDatum } from '@/components/education/EducationCharts'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'

type StudentScoreTrendChartProps = {
  assignments: Assignment[]
  quizzes: Quiz[]
}

function shortLabel(value: unknown, fallback: string) {
  const text = value === null || value === undefined ? fallback : String(value)
  return text.length > 8 ? `${text.slice(0, 8)}...` : text
}

export default function StudentScoreTrendChart({ assignments, quizzes }: StudentScoreTrendChartProps) {
  const assignmentScores: ScoreTrendDatum[] = assignments
    .filter((item) => item.submissionStatus === SubmissionStatus.Reviewed && item.score !== undefined)
    .map((item, index) => ({
      label: shortLabel(item.title, `作业${index + 1}`),
      score: Number(item.score),
      type: '作业',
    }))

  const quizScores: ScoreTrendDatum[] = quizzes
    .filter((quiz) => quiz.status === QuizStatus.Finished && quiz.score !== undefined)
    .map((quiz, index) => ({
      label: shortLabel(quiz.title, `测验${index + 1}`),
      score: Number(quiz.score),
      type: '测验',
    }))

  const data = [...assignmentScores, ...quizScores].slice(-8)

  return (
    <ChartPanel title="成绩趋势" description="最近成绩。">
      {data.length > 0 ? (
        <ScoreTrendChart data={data} />
      ) : (
        <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
          暂无已出分任务，完成作业或测验后会显示趋势。
        </div>
      )}
    </ChartPanel>
  )
}
