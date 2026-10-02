// 文件说明：学生端争分申请对话框，在争分窗口内提交对某题判分的异议。
import { useState } from 'react'
import { createCreateArgueTicketRequest } from '@/api/exam/CreateArgueTicketAPIMessage'
import { sendAPI } from '@/lib/apiClient'
import { useAuth } from '@/components/auth-context'
import type { ExamQuestion } from '@/objects/exam/ExamQuestion'
import type { ArgueTicket } from '@/objects/exam/ArgueTicket'

type ArgueDialogProps = {
  examId: string
  question: ExamQuestion | null
  existingTicket: ArgueTicket | null
  windowOpen: boolean
  onClose: () => void
  onSubmitted: () => void
}

export default function ArgueDialog({ examId, question, existingTicket, windowOpen, onClose, onSubmitted }: ArgueDialogProps) {
  const { session } = useAuth()
  const sessionToken = session?.sessionToken ?? ''
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!question) {
    return null
  }

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      setError('请填写至少 5 个字的争分理由，说明具体得分点。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await sendAPI(createCreateArgueTicketRequest(sessionToken, examId, question.id, reason))
      onSubmitted()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-950">申请争分 · 第 {question.orderIndex} 题</h3>
        <p className="mt-1 text-sm text-slate-500">{question.title}（{question.topicTag} · 满分 {question.maxScore}）</p>

        {existingTicket ? (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            这道题已有待复核的争分申请（{existingTicket.createdAt} 提交），请等待教研老师复核结果，复核后会在此处显示结论。
          </div>
        ) : !windowOpen ? (
          <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">本场考试争分窗口已关闭，无法提交申请。</div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-800">争分理由（请写明你认为应得分的步骤或结论）</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
                placeholder="例如：第 3 小问我写出了完整的中间推导，位于答题卡第二页左栏，请复核是否漏判过程分。"
              />
            </label>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {submitting ? '提交中…' : '提交争分申请'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
