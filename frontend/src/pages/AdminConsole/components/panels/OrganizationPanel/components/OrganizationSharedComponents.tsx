import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui/UiComponents'
import type { ReactNode } from 'react'

export function OrganizationModuleLink({
  to,
  title,
  description,
  badge,
}: {
  to: string
  title: string
  description: string
  badge: string
}) {
  return (
    <Link to={to} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{badge}</Badge>
      </div>
    </Link>
  )
}

export function OrganizationEditorCard({
  title,
  actionLabel,
  pending,
  onSubmit,
  children,
}: {
  title: string
  actionLabel: string
  pending: boolean
  onSubmit: () => Promise<void> | void
  children: ReactNode
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={() => void onSubmit()} disabled={pending}>
          {pending ? '处理中...' : actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

export function OrganizationField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function OrganizationListCard({ children }: { children: ReactNode }) {
  return <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">{children}</div>
}

export function OrganizationRowCard({
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  title: string
  subtitle: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl bg-white px-4 py-3">
      <button type="button" className="text-left" onClick={onEdit}>
        <p className="font-medium text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </button>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onEdit}>
          编辑
        </Button>
        <Button type="button" variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  )
}

export function OrganizationStatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}
