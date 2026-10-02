// 文件说明：教研端成绩册对话框，展示折合分排名与逐题卷面得分。
import { useEffect, useState } from 'react'
import { formatScore } from '@/components/exam/examDisplay'
import type { Exam } from '@/objects/exam/Exam'
import type { ScoreboardRow } from '@/objects/exam/ScoreboardRow'

type ScoreboardDialogProps = {
  exam: Exam
  onClose: () => void
  fetchScoreboard: (examId: string) => Promise<{ rows: ScoreboardRow[]; exam: Exam }>
}

export default function ScoreboardDialog({ exam, onClose, fetchScoreboard }: ScoreboardDialogProps) {
  const [rows, setRows] = useState<ScoreboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const result = await fetchScoreboard(exam.id)
        if (!cancelled) setRows(result.rows)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '成绩册加载失败。')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [exam.id, fetchScoreboard])

  const maxConverted = exam.questions.reduce((sum, question) => sum + question.convertedScore, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-950">成绩册 · {exam.name}</h3>
        <p className="mt-1 text-xs text-slate-500">按折合总分排名（折合满分 {formatScore(maxConverted)}）。</p>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">加载中…</p>
        ) : error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">本场考试还没有答题卡。</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">名次</th>
                  <th className="px-3 py-2">学生</th>
                  {exam.questions.map((question) => (
                    <th key={question.id} className="px-2 py-2 text-center">
                      第{question.orderIndex}题
                      <span className="block font-normal text-slate-400">/{formatScore(question.maxScore)}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right">卷面总分</th>
                  <th className="px-3 py-2 text-right">折合总分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.studentId} className={row.rank <= 3 ? 'bg-amber-50/50' : ''}>
                    <td className="px-3 py-2 font-bold text-slate-700">{row.rank}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.studentName}</td>
                    {exam.questions.map((question) => {
                      const score = row.questionScores[question.id]
                      const ratio = score !== undefined && question.maxScore > 0 ? score / question.maxScore : null
                      return (
                        <td key={question.id} className="px-2 py-2 text-center">
                          <span
                            className={
                              ratio === null
                                ? 'text-slate-300'
                                : ratio >= 0.85
                                  ? 'text-emerald-700'
                                  : ratio >= 0.6
                                    ? 'text-slate-700'
                                    : 'text-rose-600'
                            }
                          >
                            {score === undefined ? '—' : formatScore(score)}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-right text-slate-700">{formatScore(row.rawTotal)}</td>
                    <td className="px-3 py-2 text-right font-bold text-sky-950">{formatScore(row.convertedTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
