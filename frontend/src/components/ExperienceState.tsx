import { useEffect, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { AlertCircle, CheckCircle2, Inbox, Info, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent } from '@/components/ui/UiComponents'

export type NoticeTone = 'success' | 'error' | 'info'

export type NoticeState = {
  tone: NoticeTone
  title: string
  message: string
} | null

type InlineNoticeProps = {
  notice: NoticeState
}

type PageStateCardProps = {
  tone?: 'info' | 'error'
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

type EmptyStateCardProps = {
  title: string
  message: string
  action?: ReactNode
}

type FloatingNoticeProps = {
  notice: {
    tone: NoticeTone
    message: string
    title?: string
  } | null
}

export function useAutoClearNotice<T>(
  notice: T | null,
  setNotice: Dispatch<SetStateAction<T | null>>,
  duration = 4500,
) {
  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(null), duration)
    return () => window.clearTimeout(timer)
  }, [duration, notice, setNotice])
}

export function InlineNotice({ notice }: InlineNoticeProps) {
  if (!notice) {
    return null
  }

  const isSuccess = notice.tone === 'success'
  const isError = notice.tone === 'error'
  const icon = isSuccess ? <CheckCircle2 className="h-4 w-4" /> : isError ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />
  const classes = isSuccess
    ? {
        wrapper: 'rounded-3xl border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm',
        message: 'text-emerald-800',
      }
    : isError
      ? {
          wrapper: 'rounded-3xl border-red-200 bg-red-50 text-red-900 shadow-sm',
          message: 'text-red-800',
        }
      : {
          wrapper: 'rounded-3xl border-sky-200 bg-sky-50 text-sky-900 shadow-sm',
          message: 'text-sky-800',
        }

  return (
    <Alert variant={isError ? 'destructive' : 'default'} className={classes.wrapper}>
      {icon}
      <AlertTitle>{notice.title}</AlertTitle>
      <AlertDescription className={classes.message}>{notice.message}</AlertDescription>
    </Alert>
  )
}

export function FloatingNotice({ notice }: FloatingNoticeProps) {
  if (!notice) {
    return null
  }

  const isSuccess = notice.tone === 'success'
  const isError = notice.tone === 'error'
  const icon = isSuccess ? <CheckCircle2 className="h-4 w-4" /> : isError ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />
  const classes = isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : isError
      ? 'border-red-200 bg-red-50 text-red-900'
      : 'border-sky-200 bg-sky-50 text-sky-900'

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[18] w-full max-w-[min(420px,calc(100vw-2rem))]">
      <div className={`rounded-3xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur ${classes}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>
          <div className="space-y-1">
            {notice.title ? <p className="text-sm font-semibold">{notice.title}</p> : null}
            <p className="text-sm leading-6">{notice.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageStateCard({ tone = 'info', title, message, actionLabel, onAction }: PageStateCardProps) {
  const isError = tone === 'error'

  return (
    <Card
      className={
        isError
          ? 'rounded-[28px] border-red-200 bg-red-50 text-red-900 shadow-sm'
          : 'rounded-[28px] border-slate-200 bg-white text-slate-900 shadow-sm'
      }
    >
      <CardContent className="space-y-4 p-8">
        <div className="flex items-start gap-3">
          {isError ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          ) : (
            <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-sky-700" />
          )}
          <div className="space-y-1">
            <p className={isError ? 'text-base font-semibold text-red-900' : 'text-base font-semibold text-slate-950'}>{title}</p>
            <p className={isError ? 'text-sm leading-6 text-red-700' : 'text-sm leading-6 text-slate-600'}>{message}</p>
          </div>
        </div>
        {actionLabel && onAction ? (
          <div className="flex flex-wrap gap-3">
            <Button
              className={
                isError ? 'rounded-full bg-red-700 text-white hover:bg-red-800' : 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
              }
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function LoadingStateCard({ title, message }: { title: string; message: string }) {
  return <PageStateCard tone="info" title={title} message={message} />
}

export function ErrorStateCard({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return <PageStateCard tone="error" title={title} message={message} actionLabel={actionLabel} onAction={onAction} />
}

export function EmptyStateCard({ title, message, action }: EmptyStateCardProps) {
  return (
    <Card className="rounded-[28px] border-dashed border-slate-300 bg-white/90 text-slate-900 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-full bg-slate-100 p-3 text-slate-500">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-950">{title}</p>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{message}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

export function PermissionStateCard({ title, message, action }: EmptyStateCardProps) {
  return (
    <Card className="rounded-[28px] border-amber-200 bg-amber-50/90 text-amber-950 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-full bg-amber-100 p-3 text-amber-700">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-amber-950">{title}</p>
          <p className="max-w-xl text-sm leading-6 text-amber-800">{message}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
