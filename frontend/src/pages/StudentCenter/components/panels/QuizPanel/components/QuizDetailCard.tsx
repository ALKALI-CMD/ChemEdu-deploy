import { Badge, Button } from '@/components/ui/UiComponents'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'
import QuizAnswerWorkspace from './QuizAnswerWorkspace'
import QuizResultAnalysis from './QuizResultAnalysis'
import {
  formatDuration,
  getQuizTimeWindow,
  quizStatusLabel,
  type CoursePerformanceCard,
} from '../functions/quizPanelUtils'

type QuizDetailCardProps = {
  quiz: Quiz
  remainingSeconds: number
  submittedLocally: boolean
  isExamStarted: boolean
  objectiveDrafts: Record<string, QuizOption[]>
  answerDrafts: Record<string, Record<string, string[]>>
  subjectiveDrafts: Record<string, string>
  submittingKey: string | null
  finishedQuizzes: Quiz[]
  coursePerformance: CoursePerformanceCard[]
  onStart: (quizId: string) => void
  onObjectiveChange: (quizId: string, index: number, option: QuizOption) => void
  onAnswerChange: (quizId: string, questionId: string, answers: string[]) => void
  onSubjectiveChange: (quizId: string, value: string) => void
  onSubmit: (quizId: string) => void
}

export default function QuizDetailCard({
  quiz,
  remainingSeconds,
  submittedLocally,
  isExamStarted,
  objectiveDrafts,
  answerDrafts,
  subjectiveDrafts,
  submittingKey,
  finishedQuizzes,
  coursePerformance,
  onStart,
  onObjectiveChange,
  onAnswerChange,
  onSubjectiveChange,
  onSubmit,
}: QuizDetailCardProps) {
  const totalPoints = quiz.questionBank.reduce((sum, question) => sum + question.points, 0)

  return (
    <div id={`quiz-${quiz.id}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">{quiz.title}</h3>
            <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{quizStatusLabel[quiz.status]}</Badge>
            {quiz.drawCount ? <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">随机抽题 {quiz.drawCount} 题</Badge> : null}
            {quiz.shuffleQuestions ? <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">题序随机</Badge> : null}
            {quiz.shuffleOptions ? <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">选项随机</Badge> : null}
          </div>
          <p className="text-sm text-slate-500">
            时长 {quiz.durationMinutes} 分钟 / 总分 {totalPoints} / 客观题 {quiz.objectiveQuestionCount} / 主观题 {quiz.subjectiveQuestionCount}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-white">
              固定时长 {quiz.durationMinutes} 分钟
            </Badge>
            <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
              {getQuizTimeWindow(quiz)}
            </Badge>
            <Badge className={quiz.status === QuizStatus.Ongoing ? 'rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100' : 'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100'}>
              {quiz.status === QuizStatus.Ongoing ? '可进入考试' : quiz.status === QuizStatus.Upcoming ? '未到考试时间' : '考试已结束'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quiz.status !== QuizStatus.Finished ? (
            <>
              <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">剩余时间 {formatDuration(remainingSeconds)}</Badge>
              {!isExamStarted ? (
                <Button type="button" className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white" onClick={() => onStart(quiz.id)}>
                  开始作答
                </Button>
              ) : null}
            </>
          ) : (
            <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              已提交 {quiz.submittedAt ?? '时间未记录'}
            </Badge>
          )}
        </div>
      </div>

      {submittedLocally && quiz.status !== QuizStatus.Finished ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="font-medium text-emerald-950">测验已提交</p>
        </div>
      ) : quiz.status === QuizStatus.Finished ? (
        <QuizResultAnalysis quiz={quiz} coursePerformance={coursePerformance} finishedQuizzes={finishedQuizzes} />
      ) : isExamStarted ? (
        <QuizAnswerWorkspace
          quiz={quiz}
          remainingSeconds={remainingSeconds}
          objectiveDrafts={objectiveDrafts}
          answerDrafts={answerDrafts}
          subjectiveDrafts={subjectiveDrafts}
          submittingKey={submittingKey}
          onObjectiveChange={onObjectiveChange}
          onAnswerChange={onAnswerChange}
          onSubjectiveChange={onSubjectiveChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </div>
  )
}
