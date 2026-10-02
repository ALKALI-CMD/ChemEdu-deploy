import type { Quiz } from '@/objects/course/learning/Quiz'

type TeachingInsightCardsPanelProps = {
  insights: {
    completionDistributions: Array<{
      courseId: string
      courseTitle: string
      averageCompletionRate: number
      excellentCount: number
      steadyCount: number
      warningCount: number
      stuckCount: number
    }>
    questionHotspots: Array<{
      quizTitle: string
      questionId: string
      questionPrompt: string
      courseTitle: string
      questionType: string
      wrongRate: number
      wrongCount: number
      attemptCount: number
    }>
  }
  pendingSubjectiveQuizzes: Quiz[]
  courseTitleMap: Map<string, string>
}

export default function TeachingInsightCardsPanel({
  insights,
  pendingSubjectiveQuizzes,
  courseTitleMap,
}: TeachingInsightCardsPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">课程完成率分布</p>
        <div className="mt-4 space-y-3">
          {insights.completionDistributions.slice(0, 6).map((entry) => (
            <div key={entry.courseId} className="rounded-2xl bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{entry.courseTitle}</p>
                  <p className="text-sm text-slate-500">平均完成率 {entry.averageCompletionRate}%</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">均值 {entry.averageCompletionRate}%</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1">优秀 {entry.excellentCount}</span>
                <span className="rounded-full bg-sky-50 px-3 py-1">稳定 {entry.steadyCount}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1">预警 {entry.warningCount}</span>
                <span className="rounded-full bg-rose-50 px-3 py-1">掉队 {entry.stuckCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">错误率最高题目</p>
        <div className="mt-4 space-y-3">
          {insights.questionHotspots.slice(0, 6).map((question) => (
            <div key={`${question.quizTitle}-${question.questionId}`} className="rounded-2xl bg-white p-4">
              <p className="font-medium text-slate-950">{question.questionPrompt}</p>
              <p className="text-sm text-slate-500">
                {question.courseTitle} / {question.quizTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">{question.questionType}</span>
                <span className="rounded-full bg-rose-50 px-3 py-1">错误率 {question.wrongRate}%</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {question.wrongCount} / {question.attemptCount}
                </span>
              </div>
            </div>
          ))}
          {insights.questionHotspots.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">当前还没有足够的测验数据来生成题目热点。</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">待人工批改的主观题</p>
        <div className="mt-4 space-y-3">
          {pendingSubjectiveQuizzes.length > 0 ? (
            pendingSubjectiveQuizzes.map((quiz) => (
              <div key={quiz.id} className="rounded-2xl bg-white p-4">
                <p className="font-medium text-slate-950">{quiz.title}</p>
                <p className="text-sm text-slate-500">
                  {courseTitleMap.get(quiz.courseId) ?? quiz.courseId} / 客观题自动得分 {quiz.objectiveScore ?? quiz.score ?? 0}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">当前没有待批改的主观题测验。</p>
          )}
        </div>
      </div>
    </section>
  )
}
