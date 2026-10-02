import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import StudentMetricCard from './StudentMetricCard'

type StudentOverviewMetricsProps = {
  enrolledCourses: Course[]
  assignments: Assignment[]
  quizzes: Quiz[]
}

function averageScore(values: number[]) {
  if (values.length === 0) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export default function StudentOverviewMetrics({
  enrolledCourses,
  assignments,
  quizzes,
}: StudentOverviewMetricsProps) {
  const pendingAssignments = assignments.filter((item) => item.submissionStatus !== SubmissionStatus.Reviewed).length
  const runningQuizCount = quizzes.filter((quiz) => quiz.status === QuizStatus.Ongoing).length
  const recentAssignmentScores = assignments
    .filter((item) => item.submissionStatus === SubmissionStatus.Reviewed && item.score !== undefined)
    .slice(-3)
    .map((item) => Number(item.score))
  const recentQuizScores = quizzes.filter((quiz) => quiz.score !== undefined).slice(-2).map((quiz) => Number(quiz.score))
  const recentAverage = averageScore([...recentAssignmentScores, ...recentQuizScores])
  const completedCourseCount = enrolledCourses.filter((course) => Number(course.completionRate) >= 100).length

  return (
    <div className="grid grid-cols-2 gap-4">
      <StudentMetricCard
        className="border-slate-950 bg-slate-950 text-white"
        eyebrow="学习中的课程"
        value={enrolledCourses.length}
        description={`其中 ${completedCourseCount} 门已经完成全部课时`}
      />
      <StudentMetricCard
        className="border-amber-200 bg-amber-50 text-slate-900"
        eyebrow="待完成任务"
        value={pendingAssignments}
        description="未完成的作业和测验会汇总在这里"
      />
      <StudentMetricCard
        className="border-sky-200 bg-sky-50 text-slate-900"
        eyebrow="最近成绩"
        value={recentAverage ?? '暂无'}
        description={recentAverage === null ? '暂无成绩记录' : '最近 5 次已出分任务的平均成绩'}
      />
      <StudentMetricCard
        className="border-emerald-200 bg-emerald-50 text-slate-900"
        eyebrow="进行中的测验"
        value={runningQuizCount}
        description="正在进行或待处理的测验数量"
      />
    </div>
  )
}
