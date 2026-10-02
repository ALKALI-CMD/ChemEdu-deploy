import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'

const assignmentStatusLabel: Record<SubmissionStatus, string> = {
  [SubmissionStatus.Pending]: '未开始',
  [SubmissionStatus.Submitted]: '已提交',
  [SubmissionStatus.Reviewed]: '已批改',
}

const quizStatusLabel: Record<QuizStatus, string> = {
  [QuizStatus.Upcoming]: '未开始',
  [QuizStatus.Ongoing]: '进行中',
  [QuizStatus.Finished]: '已完成',
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

type CourseAssessmentsPanelProps = {
  assignments: Assignment[]
  quizzes: Quiz[]
}

export default function CourseAssessmentsPanel({ assignments, quizzes }: CourseAssessmentsPanelProps) {
  const assignmentSummary = {
    pending: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Pending).length,
    submitted: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Submitted).length,
    reviewed: assignments.filter((item) => item.submissionStatus === SubmissionStatus.Reviewed).length,
  }

  const quizSummary = {
    upcoming: quizzes.filter((item) => item.status === QuizStatus.Upcoming).length,
    ongoing: quizzes.filter((item) => item.status === QuizStatus.Ongoing).length,
    finished: quizzes.filter((item) => item.status === QuizStatus.Finished).length,
  }

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-slate-950">作业与测验</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">未开始作业</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{assignmentSummary.pending}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">待批改作业</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{assignmentSummary.submitted}</p>
          </div>
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-sm text-sky-700">进行中的测验</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{quizSummary.ongoing}</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">已完成任务</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{assignmentSummary.reviewed + quizSummary.finished}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">课程作业</p>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                {assignments.length} 项
              </Badge>
            </div>

            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{text(assignment.title)}</p>
                    <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
                      {assignmentStatusLabel[assignment.submissionStatus]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text(assignment.description)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>截止时间：{text(assignment.deadline)}</span>
                    <span>{assignment.score !== undefined ? `当前分数：${assignment.score}` : '尚未评分'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                这门课暂时还没有发布作业。
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">课程测验</p>
              <Badge variant="secondary" className="rounded-full bg-sky-50 text-sky-700">
                {quizzes.length} 项
              </Badge>
            </div>

            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{text(quiz.title)}</p>
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-50">
                      {quizStatusLabel[quiz.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {quiz.durationMinutes} 分钟 / 客观题 {quiz.objectiveQuestionCount} / 主观题 {quiz.subjectiveQuestionCount}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{quiz.score !== undefined ? `当前得分：${quiz.score}` : '尚未提交'}</span>
                    <span>{quiz.submittedAt ? `提交时间：${quiz.submittedAt}` : '等待作答'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                这门课暂时还没有安排测验。
              </div>
            )}
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
