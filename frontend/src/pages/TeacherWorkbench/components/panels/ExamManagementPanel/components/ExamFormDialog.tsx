// 文件说明：教研端考试创建/编辑对话框，录入试卷题目、卷面满分与折合满分。
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Exam } from '@/objects/exam/Exam'
import type { ExamQuestion } from '@/objects/exam/ExamQuestion'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'
import type { UpsertExamPayload } from '@/api/exam/UpsertExamAPIMessage'

type ExamFormDialogProps = {
  exam: Exam | null
  defaultCohortId: string | null
  cohorts: TrainingCohort[]
  onClose: () => void
  onSubmit: (payload: Omit<UpsertExamPayload, 'sessionToken'>) => Promise<void>
}

function emptyQuestion(orderIndex: number): ExamQuestion {
  return {
    id: '',
    orderIndex,
    title: '',
    topicTag: '',
    maxScore: 10,
    convertedScore: 10,
    referenceAnswer: '',
  }
}

export default function ExamFormDialog({ exam, defaultCohortId, cohorts, onClose, onSubmit }: ExamFormDialogProps) {
  const [cohortId, setCohortId] = useState(exam?.cohortId ?? defaultCohortId ?? cohorts[0]?.id ?? '')
  const [name, setName] = useState(exam?.name ?? '')
  const [description, setDescription] = useState(exam?.description ?? '')
  const [scheduledStart, setScheduledStart] = useState(exam?.scheduledStart ?? '')
  const [scheduledEnd, setScheduledEnd] = useState(exam?.scheduledEnd ?? '')
  const [argueHours, setArgueHours] = useState(String(exam?.argueHours ?? 48))
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    exam?.questions.length ? exam.questions : [emptyQuestion(1)],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateQuestion = (index: number, patch: Partial<ExamQuestion>) => {
    setQuestions((current) => current.map((question, i) => (i === index ? { ...question, ...patch } : question)))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请填写考试名称。')
      return
    }
    if (!cohortId) {
      setError('请选择所属期次。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        id: exam?.id ?? null,
        cohortId,
        name,
        description,
        scheduledStart: scheduledStart.replace('T', ' '),
        scheduledEnd: scheduledEnd.replace('T', ' '),
        argueHours: Number(argueHours) || 48,
        questions,
      })
      onClose()
    } catch (submitCatch) {
      setError(submitCatch instanceof Error ? submitCatch.message : '保存失败，请重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-950">{exam ? '编辑考试' : '创建考试'}</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">所属期次 *</span>
            <select
              value={cohortId}
              onChange={(event) => setCohortId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">考试名称 *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="例如：国初模拟考试（三）"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">考试开始</span>
            <input
              type="datetime-local"
              value={scheduledStart.replace(' ', 'T')}
              onChange={(event) => setScheduledStart(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">考试结束</span>
            <input
              type="datetime-local"
              value={scheduledEnd.replace(' ', 'T')}
              onChange={(event) => setScheduledEnd(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">考试说明</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="考试范围、注意事项等"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">争分窗口（公布成绩后开放小时数）</span>
            <input
              type="number"
              min={1}
              value={argueHours}
              onChange={(event) => setArgueHours(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              试卷题目（{questions.length} 题 · 卷面 {questions.reduce((sum, q) => sum + (Number(q.maxScore) || 0), 0)} 分 · 折合 {questions.reduce((sum, q) => sum + (Number(q.convertedScore) || 0), 0)} 分）
            </p>
            <button
              type="button"
              onClick={() => setQuestions((current) => [...current, emptyQuestion(current.length + 1)])}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-700"
            >
              <Plus className="h-3.5 w-3.5" /> 添加题目
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="grid gap-2 sm:grid-cols-[2fr_1.2fr_0.7fr_0.7fr_auto]">
                  <input
                    value={question.title}
                    onChange={(event) => updateQuestion(index, { title: event.target.value })}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder={`第 ${index + 1} 题标题`}
                  />
                  <input
                    value={question.topicTag}
                    onChange={(event) => updateQuestion(index, { topicTag: event.target.value })}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="知识模块（如 结构化学）"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={question.maxScore}
                    onChange={(event) => updateQuestion(index, { maxScore: Number(event.target.value) })}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="卷面分"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={question.convertedScore}
                    onChange={(event) => updateQuestion(index, { convertedScore: Number(event.target.value) })}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="折合分"
                  />
                  <button
                    type="button"
                    onClick={() => setQuestions((current) => current.filter((_, i) => i !== index).map((q, i) => ({ ...q, orderIndex: i + 1 })))}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600"
                    title="删除题目"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={question.referenceAnswer}
                  onChange={(event) => updateQuestion(index, { referenceAnswer: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  placeholder="参考答案要点（供助教判分参考）"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
            取消
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="rounded-lg bg-sky-900 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {submitting ? '保存中…' : '保存考试'}
          </button>
        </div>
      </div>
    </div>
  )
}
