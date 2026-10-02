import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import type { Quiz } from '@/objects/course/learning/Quiz'
import QuizDetailCard from './components/QuizDetailCard'
import QuizFilters from './components/QuizFilters'
import QuizList from './components/QuizList'
import QuizPerformanceOverview from './components/QuizPerformanceOverview'
import QuizStatusSummary from './components/QuizStatusSummary'
import useStudentQuizPanelState from './hooks/useStudentQuizPanelState'

type QuizPanelProps = {
  quizzes: Quiz[]
  focusQuizId?: string
  focusQuestionId?: string
  objectiveDrafts: Record<string, QuizOption[]>
  answerDrafts: Record<string, Record<string, string[]>>
  subjectiveDrafts: Record<string, string>
  submittingKey: string | null
  onObjectiveChange: (quizId: string, index: number, option: QuizOption) => void
  onAnswerChange: (quizId: string, questionId: string, answers: string[]) => void
  onSubjectiveChange: (quizId: string, value: string) => void
  onSubmit: (quizId: string) => Promise<boolean>
}

export default function QuizPanel({
  quizzes,
  focusQuizId,
  focusQuestionId,
  objectiveDrafts,
  answerDrafts,
  subjectiveDrafts,
  submittingKey,
  onObjectiveChange,
  onAnswerChange,
  onSubjectiveChange,
  onSubmit,
}: QuizPanelProps) {
  const quizPanelState = useStudentQuizPanelState({
    quizzes,
    focusQuizId,
    focusQuestionId,
    submittingKey,
    onSubmit,
  })

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-slate-950">测验作答与结果分析</CardTitle>
        <QuizFilters quizzes={quizzes} value={quizPanelState.filter} onChange={quizPanelState.setFilter} />
        <QuizStatusSummary quizzes={quizzes} />
      </CardHeader>
      <CardContent className="space-y-6">
        <QuizPerformanceOverview
          finishedCount={quizPanelState.finishedQuizzes.length}
          coursePerformance={quizPanelState.cumulativeCoursePerformance}
          scoreTrend={quizPanelState.scoreTrend}
        />

        {!focusQuizId ? <QuizList quizzes={quizPanelState.filteredQuizzes} /> : null}

        {quizPanelState.detailQuizzes.map((quiz) => {
          const sessionView = quizPanelState.getQuizSessionView(quiz)
          return (
            <QuizDetailCard
              key={quiz.id}
              quiz={quiz}
              remainingSeconds={sessionView.remainingSeconds}
              submittedLocally={sessionView.submittedLocally}
              isExamStarted={sessionView.isExamStarted}
              objectiveDrafts={objectiveDrafts}
              answerDrafts={answerDrafts}
              subjectiveDrafts={subjectiveDrafts}
              submittingKey={submittingKey}
              finishedQuizzes={quizPanelState.finishedQuizzes}
              coursePerformance={quizPanelState.cumulativeCoursePerformance}
              onStart={quizPanelState.startQuiz}
              onObjectiveChange={onObjectiveChange}
              onAnswerChange={onAnswerChange}
              onSubjectiveChange={onSubjectiveChange}
              onSubmit={(quizId) => void quizPanelState.submitQuiz(quizId)}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
