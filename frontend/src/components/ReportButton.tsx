import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea } from '@/components/ui/UiComponents'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'

const reasonOptions = ['内容不当', '骚扰或辱骂', '虚假信息', '侵权或作弊', '其他'] as const

type ReportButtonProps = {
  targetType: string
  targetId: string
  targetLabel: string
  label?: string
  className?: string
  onSubmit: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

export default function ReportButton({
  targetType,
  targetId,
  targetLabel,
  label = '举报',
  className,
  onSubmit,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>(reasonOptions[0])
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(targetType, targetId, targetLabel, reason, detail.trim() || undefined)
      setDetail('')
      setReason(reasonOptions[0])
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '举报提交失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button type="button" variant="outline" className={className} onClick={() => setOpen(true)}>
        <AlertTriangle className="mr-1 size-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(92vw,32rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>提交举报</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              举报对象：{targetLabel}
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              举报原因
              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                {reasonOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              具体说明
              <Textarea
                className="min-h-28"
                value={detail}
                placeholder="尽量说明发生了什么、影响是什么，以及管理员需要重点查看的内容。"
                onChange={(event) => setDetail(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? '提交中…' : '提交给管理员'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
