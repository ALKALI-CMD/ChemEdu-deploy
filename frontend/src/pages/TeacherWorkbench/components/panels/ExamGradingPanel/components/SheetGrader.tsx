// 文件说明：助教阅卷工作台，左侧答题卡视图 + 右侧逐题打分，支持键盘回车提交。
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import SheetRegionOverlay, { type SheetRegionTone } from '@/components/exam/SheetRegionOverlay'
import { formatScore } from '@/components/exam/examDisplay'
import type { Exam } from '@/objects/exam/Exam'
import type { AnswerSheet } from '@/objects/exam/AnswerSheet'
import type { QuestionScoreEntry } from '@/objects/exam/QuestionScoreEntry'
import type { ArgueTicket } from '@/objects/exam/ArgueTicket'

type SheetGraderProps = {
  exam: Exam
  sheet: AnswerSheet
  scores: QuestionScoreEntry[]
  argues: ArgueTicket[]
  onBack: () => void
  onSaveScore: (sheetId: string, questionId: string, score: number, comment: string) => Promise<void>
  onSwitchSheet: (sheetId: string) => void
  sheetIds: string[]
}

export default function SheetGrader({
  exam,
  sheet,
  scores,
  argues,
  onBack,
  onSaveScore,
  onSwitchSheet,
  sheetIds,
}: SheetGraderProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(exam.questions[0]?.id ?? null)
  const [draftScores, setDraftScores] = useState<Record<string, string>>({})
  const [draftComments, setDraftComments] = useState<Record<string, string>>({})
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scoreByQuestion = useMemo(
    () => new Map(scores.filter((entry) => entry.sheetId === sheet.id).map((entry) => [entry.questionId, entry])),
    [scores, sheet.id],
  )
  const openArgueByQuestion = useMemo(
    () => new Map(argues.filter((ticket) => ticket.sheetId === sheet.id && ticket.status === 'open').map((ticket) => [ticket.questionId, ticket])),
    [argues, sheet.id],
  )

  useEffect(() => {
    setSelectedQuestionId(exam.questions[0]?.id ?? null)
    setDraftScores({})
    setDraftComments({})
    setError(null)
  }, [sheet.id, exam.questions])

  const regionTones: Record<string, SheetRegionTone> = {}
  const regionLabels: Record<string, string> = {}
  for (const question of exam.questions) {
    regionLabels[question.id] = `第 ${question.orderIndex} 题`
    if (openArgueByQuestion.has(question.id)) {
      regionTones[question.id] = 'argued'
    } else if (scoreByQuestion.has(question.id)) {
      regionTones[question.id] = 'graded'
    }
  }

  const saveQuestion = async (questionId: string) => {
    const question = exam.questions.find((item) => item.id === questionId)
    if (!question) return
    const rawValue = draftScores[questionId] ?? String(scoreByQuestion.get(questionId)?.score ?? '')
    if (rawValue.trim() === '') {
      setError('请先填写分数。')
      return
    }
    const score = Number(rawValue)
    if (!Number.isFinite(score) || score < 0 || score > question.maxScore) {
      setError(`分数必须在 0 到 ${question.maxScore} 之间。`)
      return
    }
    setSavingQuestionId(questionId)
    setError(null)
    try {
      await onSaveScore(sheet.id, questionId, score, draftComments[questionId] ?? '')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败，请重试。')
    } finally {
      setSavingQuestionId(null)
    }
  }

  const currentIndex = sheetIds.indexOf(sheet.id)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-700"
          >
            <ArrowLeft className="h-4 w-4" /> 返回队列
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-950">{sheet.studentName} · {exam.name}</p>
            <p className="text-xs text-slate-500">
              上传：{sheet.uploadedByName} · {sheet.status === 'graded' ? '已阅完' : '待判分'} · 折合分 {formatScore(sheet.convertedTotal)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            disabled={currentIndex <= 0}
            onClick={() => onSwitchSheet(sheetIds[currentIndex - 1])}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40"
          >
            上一张
          </button>
          <span className="text-xs text-slate-500">{currentIndex + 1} / {sheetIds.length}</span>
          <button
            type="button"
            disabled={currentIndex < 0 || currentIndex >= sheetIds.length - 1}
            onClick={() => onSwitchSheet(sheetIds[currentIndex + 1])}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40"
          >
            下一张
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24">
          <SheetRegionOverlay
            imageUrl={sheet.imageDataUrl}
            regions={exam.gradingRegions}
            regionTones={regionTones}
            regionLabels={regionLabels}
            selectedQuestionId={selectedQuestionId}
            onSelectRegion={setSelectedQuestionId}
          />
        </div>

        <div className="space-y-2">
          {exam.questions.map((question) => {
            const entry = scoreByQuestion.get(question.id)
            const isSelected = question.id === selectedQuestionId
            const hasOpenArgue = openArgueByQuestion.has(question.id)
            return (
              <div
                key={question.id}
                className={`rounded-xl border p-3 transition ${
                  isSelected ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-white/80'
                }`}
                onClick={() => setSelectedQuestionId(question.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      第 {question.orderIndex} 题
                      <span className="ml-2 text-xs font-normal text-slate-500">{question.topicTag} · 满分 {formatScore(question.maxScore)} / 折合 {formatScore(question.convertedScore)}</span>
                    </p>
                    <p className="text-xs text-slate-500">{question.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasOpenArgue && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">学生争分中</span>}
                    {entry?.adjusted && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">复核调整</span>}
                    <span className={`text-xs ${entry ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {entry ? `已判 ${formatScore(entry.score)}` : '未判'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={question.maxScore}
                    step={0.5}
                    value={draftScores[question.id] ?? (entry ? String(entry.score) : '')}
                    onChange={(event) => setDraftScores((current) => ({ ...current, [question.id]: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void saveQuestion(question.id)
                      }
                    }}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-600"
                    placeholder={`0-${question.maxScore}`}
                  />
                  <input
                    value={draftComments[question.id] ?? entry?.comment ?? ''}
                    onChange={(event) => setDraftComments((current) => ({ ...current, [question.id]: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void saveQuestion(question.id)
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-600"
                    placeholder="判分说明（可选，会展示给学生）"
                  />
                  <button
                    type="button"
                    onClick={() => void saveQuestion(question.id)}
                    disabled={savingQuestionId === question.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingQuestionId === question.id ? '保存中…' : '保存'}
                  </button>
                </div>
                {entry && (
                  <p className="mt-1 text-xs text-slate-400">
                    判分人：{entry.graderName} · {entry.gradedAt.slice(0, 19).replace('T', ' ')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
