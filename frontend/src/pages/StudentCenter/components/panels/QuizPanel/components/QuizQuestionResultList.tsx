import { Badge } from '@/components/ui/UiComponents'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { formatAnswers, getQuestionAnswerRecord, questionTypeLabel } from '../functions/quizPanelUtils'

type QuizQuestionResultListProps = {
  quiz: Quiz
}

export default function QuizQuestionResultList({ quiz }: QuizQuestionResultListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">逐题结果明细</p>
        {quiz.subjectiveFeedback ? <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">教师评语已返回</Badge> : null}
      </div>
      {quiz.questionBank.map((question, index) => {
        const answerRecord = getQuestionAnswerRecord(quiz, question.id)
        const wrong = quiz.wrongQuestionIds.includes(question.id)

        return (
          <div key={question.id} id={`quiz-question-${question.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">第 {index + 1} 题</Badge>
              <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{questionTypeLabel[question.questionType]}</Badge>
              <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{question.points} 分</Badge>
              {wrong ? (
                <Badge className="rounded-full bg-rose-50 text-rose-700 hover:bg-rose-50">本题失分</Badge>
              ) : (
                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">本题得分</Badge>
              )}
            </div>
            <p className="mt-3 font-medium leading-7 text-slate-950">{question.prompt}</p>
            {question.options.length > 0 ? (
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                {question.options.map((option) => (
                  <div key={option.key} className="rounded-2xl bg-slate-50 px-3 py-2">
                    {option.key}. {option.label}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">你的答案</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {question.questionType === QuizQuestionType.Subjective ? quiz.subjectiveAnswer ?? '未作答' : formatAnswers(answerRecord?.submittedAnswers ?? [])}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">正确答案</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">{formatAnswers(question.correctAnswers)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">题目解析</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">{question.explanation || '这道题暂时还没有补充解析。'}</p>
              </div>
            </div>
          </div>
        )
      })}
      {quiz.subjectiveFeedback ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-medium text-sky-950">教师评语</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{quiz.subjectiveFeedback}</p>
        </div>
      ) : null}
    </section>
  )
}
