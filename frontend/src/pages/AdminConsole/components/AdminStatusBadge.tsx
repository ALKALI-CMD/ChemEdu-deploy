import { StatusPill, type StatusTone } from '@/components/education/DisplayPrimitives'

type AdminStatusBadgeProps = {
  label: string
  tone?: StatusTone
}

export default function AdminStatusBadge({ label, tone = 'neutral' }: AdminStatusBadgeProps) {
  return <StatusPill tone={tone}>{label}</StatusPill>
}
