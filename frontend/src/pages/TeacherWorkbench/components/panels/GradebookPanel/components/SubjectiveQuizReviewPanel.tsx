import { Link } from 'react-router-dom'
import { Button, Input, Textarea } from '@/components/ui/UiComponents'
import type { Quiz } from '@/objects/course/learning/Quiz'

type SubjectiveQuizReviewPanelProps = {
  detailQuizId?: string
  pendingSubjectiveQuizzes: Quiz[]
  selectedSubjectiveQuiz: Quiz | null
  selectedSubjectiveQuizId: string | null
  scoreDrafts: Record<string, string>
  feedbackDrafts: Record<string, string>
  submittingQuizId: string | null
  courseTitleMap: Map<string, string>
  onScoreDraftChange: (quizId: string, value: string) => void
  onFeedbackDraftChange: (quizId: string, value: string) => void
  onSubmitReview: (quiz: Quiz) => void
}

export default function SubjectiveQuizReviewPanel({
  detailQuizId,
  pendingSubjectiveQuizzes,
  selectedSubjectiveQuiz,
  selectedSubjectiveQuizId,
  scoreDrafts,
  feedbackDrafts,
  submittingQuizId,
  courseTitleMap,
  onScoreDraftChange,
  onFeedbackDraftChange,
  onSubmitReview,
}: SubjectiveQuizReviewPanelProps) {
  if (pendingSubjectiveQuizzes.length === 0) return null

  return (
    <section className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-950">主观题人工批改</h3>
      </div>
      <div className={detailQuizId ? 'grid gap-4 xl:grid-cols-[0.9fr_1.1fr]' : 'grid gap-4'}>
        {!detailQuizId ? (
          <div className="space-y-3">
            {pendingSubjectiveQuizzes.map((quiz) => {
              const selected = selectedSubjectiveQuizId === quiz.id

              return (
                <Link
                  key={quiz.id}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected ? 'block border-amber-300 bg-white shadow-sm' : 'block border-amber-200 bg-amber-50 hover:bg-white'
                  }`}
                  to={`/teacher/gradebook/quiz/${quiz.id}`}
                >
                  <p className="font-medium text-slate-950">{quiz.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {courseTitleMap.get(quiz.courseId) ?? quiz.courseId} / 客观题 {quiz.objectiveScore ?? quiz.score ?? 0}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">主观题 {quiz.subjectiveQuestionCount} 题</p>
                </Link>
              )
            })}
          </div>
        ) : null}

        {detailQuizId && selectedSubjectiveQuiz ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <p className="font-medium text-slate-950">{selectedSubjectiveQuiz.title}</p>
              <p className="text-sm text-slate-500">
                {courseTitleMap.get(selectedSubjectiveQuiz.courseId) ?? selectedSubjectiveQuiz.courseId} / 客观题自动得分 {selectedSubjectiveQuiz.objectiveScore ?? selectedSubjectiveQuiz.score ?? 0}
              </p>
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500">学生主观题作答</p>
              <p className="mt-2 whitespace-pre-wrap leading-6">{selectedSubjectiveQuiz.subjectiveAnswer ?? '学生尚未填写主观题答案。'}</p>
            </div>
            <div className="mt-4 grid gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="请输入主观题得分（0-100）"
                value={scoreDrafts[selectedSubjectiveQuiz.id] ?? ''}
                onChange={(event) => onScoreDraftChange(selectedSubjectiveQuiz.id, event.target.value)}
              />
              <Textarea
                className="min-h-24 bg-white"
                placeholder="填写评语，学生会在测验结果页看到这条反馈。"
                value={feedbackDrafts[selectedSubjectiveQuiz.id] ?? ''}
                onChange={(event) => onFeedbackDraftChange(selectedSubjectiveQuiz.id, event.target.value)}
              />
              <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>最终总分会按客观题和主观题的实际分值占比自动折算。</span>
                <Button
                  type="button"
                  className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                  disabled={submittingQuizId === selectedSubjectiveQuiz.id}
                  onClick={() => onSubmitReview(selectedSubjectiveQuiz)}
                >
                  {submittingQuizId === selectedSubjectiveQuiz.id ? '提交中...' : '提交主观题评分'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
