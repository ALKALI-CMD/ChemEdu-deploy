// 文件说明：教研端期次管理对话框，创建或编辑培训期次并选择学员名单。
import { useMemo, useState } from 'react'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { TrainingCohort } from '@/objects/exam/TrainingCohort'
import type { CohortFormInput } from '../hooks/useExamManagementData'

type ExamCohortDialogProps = {
  cohort: TrainingCohort | null
  users: UserProfile[]
  onClose: () => void
  onSubmit: (input: CohortFormInput) => Promise<void>
}

const seasonOptions = ['寒假班', '春季班', '暑期班', '秋季班', '国决冲刺']

export default function ExamCohortDialog({ cohort, users, onClose, onSubmit }: ExamCohortDialogProps) {
  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users])
  const [name, setName] = useState(cohort?.name ?? '')
  const [season, setSeason] = useState(cohort?.season ?? '春季班')
  const [startDate, setStartDate] = useState(cohort?.startDate ?? '')
  const [endDate, setEndDate] = useState(cohort?.endDate ?? '')
  const [description, setDescription] = useState(cohort?.description ?? '')
  const [memberIds, setMemberIds] = useState<string[]>(cohort?.memberIds ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleMember = (studentId: string) => {
    setMemberIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请填写期次名称。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        id: cohort?.id ?? null,
        name,
        season,
        startDate,
        endDate,
        description,
        memberIds,
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
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-950">{cohort ? '编辑期次' : '新建期次'}</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">期次名称 *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="例如：2026 春季高端 VIP 班"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-800">季节</span>
              <select
                value={season}
                onChange={(event) => setSeason(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {seasonOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-800">开始日期</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-800">结束日期</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">期次说明</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
            />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-800">学员名单（{memberIds.length} 人）</p>
            <div className="mt-2 grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(student.id)}
                    onChange={() => toggleMember(student.id)}
                    className="accent-sky-900"
                  />
                  {student.name}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>
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
            {submitting ? '保存中…' : '保存期次'}
          </button>
        </div>
      </div>
    </div>
  )
}
