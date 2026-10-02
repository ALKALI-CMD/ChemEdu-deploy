// 文件说明：教研端争分处理队列，逐条复核学生的判分异议并支持调整得分。
import { useState } from 'react'
import { formatDateTime, presentArgueStatus } from '@/components/exam/examDisplay'
import type { ArgueTicket } from '@/objects/exam/ArgueTicket'
import type { Exam } from '@/objects/exam/Exam'

type ArgueQueueProps = {
  tickets: ArgueTicket[]
  exams: Exam[]
  onResolve: (input: {
    ticketId: string
    action: 'adjust' | 'uphold' | 'reject'
    response: string
    adjustedScore: number | null
    adjustedComment: string | null
  }) => Promise<void>
}

export default function ArgueQueue({ tickets, exams, onResolve }: ArgueQueueProps) {
  const [handledIds, setHandledIds] = useState<string[]>([])

  const examById = new Map(exams.map((exam) => [exam.id, exam]))
  const openTickets = tickets.filter((ticket) => ticket.status === 'open')
  const closedTickets = tickets.filter((ticket) => ticket.status !== 'open')

  return (
    <div className="space-y-4">
      {openTickets.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          没有待复核的争分申请。
        </p>
      ) : (
        openTickets.map((ticket) => (
          <ArgueReviewCard
            key={ticket.id}
            ticket={ticket}
            exam={examById.get(ticket.examId) ?? null}
            onResolve={onResolve}
            onDone={() => setHandledIds((current) => [...current, ticket.id])}
            done={handledIds.includes(ticket.id)}
          />
        ))
      )}

      {closedTickets.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            已处理的争分记录（{closedTickets.length}）
          </summary>
          <div className="mt-3 space-y-2">
            {closedTickets.map((ticket) => {
              const status = presentArgueStatus(ticket.status)
              return (
                <div key={ticket.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">
                      {ticket.studentName} · {ticket.questionTitle}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">申诉于 {formatDateTime(ticket.createdAt)}：{ticket.reason}</p>
                  {ticket.response && <p className="mt-1 text-xs text-slate-600">复核结论：{ticket.response}</p>}
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}

function ArgueReviewCard({
  ticket,
  exam,
  onResolve,
  onDone,
  done,
}: {
  ticket: ArgueTicket
  exam: Exam | null
  onResolve: ArgueQueueProps['onResolve']
  onDone: () => void
  done: boolean
}) {
  const [response, setResponse] = useState('')
  const [adjustedScore, setAdjustedScore] = useState('')
  const [adjustedComment, setAdjustedComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const question = exam?.questions.find((item) => item.id === ticket.questionId) ?? null

  const submit = async (action: 'adjust' | 'uphold' | 'reject') => {
    if (!response.trim()) {
      setError('请填写复核结论。')
      return
    }
    if (action === 'adjust' && (!adjustedScore || !Number.isFinite(Number(adjustedScore)))) {
      setError('调整得分时请填写新分数。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onResolve({
        ticketId: ticket.id,
        action,
        response,
        adjustedScore: action === 'adjust' ? Number(adjustedScore) : null,
        adjustedComment: action === 'adjust' && adjustedComment.trim() ? adjustedComment : null,
      })
      onDone()
    } catch (submitCatch) {
      setError(submitCatch instanceof Error ? submitCatch.message : '提交失败，请重试。')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        {ticket.studentName} 的争分已复核完毕。
      </p>
    )
  }

  return (
    <article className="rounded-2xl border border-rose-200 bg-white/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {ticket.studentName} · 第 {exam?.questions.find((item) => item.id === ticket.questionId)?.orderIndex ?? '?'} 题
            {question ? `（${question.topicTag}）` : ''}
          </p>
          <p className="text-xs text-slate-500">
            {ticket.questionTitle} · 考试：{examByIdName(exam)} · 提交于 {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">待复核</span>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        <span className="font-medium text-slate-800">学生申诉理由：</span>
        {ticket.reason}
      </div>

      {question && (
        <p className="mt-2 text-xs text-slate-500">
          判分参考：{question.referenceAnswer || '（未录入参考答案要点）'}
        </p>
      )}

      <div className="mt-3 space-y-2">
        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
          placeholder="复核结论（会展示给学生）"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            step={0.5}
            value={adjustedScore}
            onChange={(event) => setAdjustedScore(event.target.value)}
            className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            placeholder={question ? `0-${question.maxScore}` : '新分数'}
          />
          <input
            value={adjustedComment}
            onChange={(event) => setAdjustedComment(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            placeholder="调整后的判分说明（可选）"
          />
        </div>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => void submit('adjust')}
            disabled={submitting}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            调整得分
          </button>
          <button
            type="button"
            onClick={() => void submit('uphold')}
            disabled={submitting}
            className="rounded-lg bg-sky-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            维持原判
          </button>
          <button
            type="button"
            onClick={() => void submit('reject')}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-rose-400 disabled:opacity-60"
          >
            驳回
          </button>
        </div>
      </div>
    </article>
  )
}

function examByIdName(exam: Exam | null): string {
  return exam?.name ?? '未知考试'
}
