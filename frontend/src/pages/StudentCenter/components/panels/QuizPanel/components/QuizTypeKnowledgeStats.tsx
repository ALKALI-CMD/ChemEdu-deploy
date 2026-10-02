import { Badge } from '@/components/ui/UiComponents'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { buildKnowledgePointStats, getTypeStats, questionTypeLabel } from '../functions/quizPanelUtils'

type QuizTypeKnowledgeStatsProps = {
  quiz: Quiz
}

export default function QuizTypeKnowledgeStats({ quiz }: QuizTypeKnowledgeStatsProps) {
  const typeStats = getTypeStats(quiz)
  const knowledgeStats = buildKnowledgePointStats(quiz)

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-900">按题型统计</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {typeStats.map(([type, stat]) => (
            <div key={type} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-950">{questionTypeLabel[type]}</p>
              <p className="mt-1 text-sm text-slate-500">
                正确 {stat.correct} / 错误 {stat.wrong} / 得分 {stat.earnedPoints}/{stat.totalPoints}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-900">按知识点统计</p>
        <div className="mt-3 space-y-3">
          {knowledgeStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-950">{stat.label}</p>
                <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{stat.accuracy}%</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                题目 {stat.total} / 正确 {stat.correct} / 错误 {stat.wrong} / 得分 {stat.earnedPoints}/{stat.totalPoints}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
