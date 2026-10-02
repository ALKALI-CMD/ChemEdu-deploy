import type { ReactNode } from 'react'
import { Badge, Card, CardContent } from '@/components/ui/UiComponents'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: ReactNode
  description?: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}

function MetricCard({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card className={cn('motion-card animate-fade-up border-slate-200 bg-white text-slate-900 shadow-sm', className)}>
      <CardContent className="p-5">
        <p className={cn('text-sm font-medium text-slate-500', labelClassName)}>{label}</p>
        <p className={cn('mt-2 text-3xl font-semibold tracking-tight text-slate-950', valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  )
}

type InfoTileProps = {
  label: string
  value: ReactNode
  icon?: ReactNode
  className?: string
}

function InfoTile({ label, value, icon, className }: InfoTileProps) {
  return (
    <div className={cn('surface-hover rounded-2xl border border-slate-200 bg-slate-50 p-4', className)}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-950">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  )
}

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const statusToneClassName: Record<StatusTone, string> = {
  neutral: 'border border-slate-200 bg-white text-slate-900 hover:bg-white',
  info: 'border border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-50',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50',
  warning: 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50',
  danger: 'border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-50',
}

type StatusPillProps = {
  children: ReactNode
  tone?: StatusTone
  className?: string
}

function StatusPill({ children, tone = 'neutral', className }: StatusPillProps) {
  return (
    <Badge className={cn('rounded-full', statusToneClassName[tone], tone !== 'neutral' && 'status-feedback', className)}>
      {children}
    </Badge>
  )
}

type ActionPanelProps = {
  title: string
  description: ReactNode
  actions: ReactNode
  className?: string
}

function ActionPanel({ title, actions, className }: ActionPanelProps) {
  return (
    <div
      className={cn(
        'animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3',
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  )
}

export { ActionPanel, InfoTile, MetricCard, StatusPill }
export type { StatusTone }
