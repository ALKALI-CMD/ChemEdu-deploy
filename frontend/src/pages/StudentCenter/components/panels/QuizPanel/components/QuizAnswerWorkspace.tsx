import { Badge, Button, Input, Textarea } from '@/components/ui/UiComponents'
import { QuizOption } from '@/objects/course/learning/QuizOption'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { formatDuration, questionTypeLabel } from '../functions/quizPanelUtils'

type QuizAnswerWorkspaceProps = {
  quiz: Quiz
  remainingSeconds: number
  objectiveDrafts: Record<string, QuizOption[]>
  answerDrafts: Record<string, Record<string, string[]>>
  subjectiveDrafts: Record<string, string>
  submittingKey: string | null
  onObjectiveChange: (quizId: string, index: number, option: QuizOption) => void
  onAnswerChange: (quizId: string, questionId: string, answers: string[]) => void
  onSubjectiveChange: (quizId: string, value: string) => void
  onSubmit: (quizId: string) => void
}

export default function QuizAnswerWorkspace({
  quiz,
  remainingSeconds,
  objectiveDrafts,
  answerDrafts,
  subjectiveDrafts,
  submittingKey,
  onObjectiveChange,
  onAnswerChange,
  onSubjectiveChange,
  onSubmit,
}: QuizAnswerWorkspaceProps) {
  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mt-2 text-2xl font-semibold text-slate-950">{formatDuration(remainingSeconds)}</p>
      </div>
      {quiz.questionBank.map((question, index) => (
        <div key={question.id} id={`quiz-question-${question.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">第 {index + 1} 题</Badge>
            <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{questionTypeLabel[question.questionType]}</Badge>
            <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{question.points} 分</Badge>
          </div>
          <p className="mt-3 font-medium leading-7 text-slate-950">{question.prompt}</p>

          {question.questionType === QuizQuestionType.SingleChoice || question.questionType === QuizQuestionType.TrueFalse ? (
            <div className="mt-4 grid gap-2">
              {question.options.map((option) => (
                <label key={option.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name={`${quiz.id}-${question.id}`}
                    checked={objectiveDrafts[quiz.id]?.[index] === option.key}
                    onChange={() => onObjectiveChange(quiz.id, index, option.key as QuizOption)}
                  />
                  <span>{option.key}. {option.label}</span>
                </label>
              ))}
            </div>
          ) : null}

          {question.questionType === QuizQuestionType.MultipleChoice ? (
            <div className="mt-4 grid gap-2">
              {question.options.map((option) => {
                const currentAnswers = answerDrafts[quiz.id]?.[question.id] ?? []
                const checked = currentAnswers.includes(option.key)
                return (
                  <label key={option.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked ? [...currentAnswers, option.key] : currentAnswers.filter((item) => item !== option.key)
                        onAnswerChange(quiz.id, question.id, next)
                      }}
                    />
                    <span>{option.key}. {option.label}</span>
                  </label>
                )
              })}
            </div>
          ) : null}

          {question.questionType === QuizQuestionType.FillBlank ? (
            <div className="mt-4 grid gap-3">
              {(question.correctAnswers.length > 0 ? question.correctAnswers : ['']).map((_, blankIndex) => {
                const currentAnswers = answerDrafts[quiz.id]?.[question.id] ?? []
                return (
                  <Input
                    key={`${question.id}-${blankIndex}`}
                    className="bg-white"
                    placeholder={`请填写第 ${blankIndex + 1} 个空`}
                    value={currentAnswers[blankIndex] ?? ''}
                    onChange={(event) => {
                      const nextAnswers = [...currentAnswers]
                      nextAnswers[blankIndex] = event.target.value
                      onAnswerChange(quiz.id, question.id, nextAnswers)
                    }}
                  />
                )
              })}
            </div>
          ) : null}

          {question.questionType === QuizQuestionType.Subjective ? (
            <Textarea
              className="mt-4 min-h-28 bg-white"
              placeholder="请输入你的主观题作答内容"
              value={subjectiveDrafts[quiz.id] ?? ''}
              onChange={(event) => onSubjectiveChange(quiz.id, event.target.value)}
            />
          ) : null}
        </div>
      ))}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white"
          disabled={submittingKey === `quiz:${quiz.id}`}
          onClick={() => onSubmit(quiz.id)}
        >
          {submittingKey === `quiz:${quiz.id}` ? '提交中...' : '提交测验'}
        </Button>
      </div>
    </div>
  )
}
