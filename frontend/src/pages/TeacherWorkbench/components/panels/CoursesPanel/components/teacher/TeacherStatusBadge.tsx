import { Badge } from '@/components/ui/UiComponents'

type TeacherStatusBadgeProps = {
  label: string
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'dark'
}

const toneClassName: Record<NonNullable<TeacherStatusBadgeProps['tone']>, string> = {
  neutral: 'border border-slate-200 bg-white text-slate-900 hover:bg-white',
  info: 'bg-sky-100 text-sky-900 hover:bg-sky-100',
  success: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
  warning: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
  dark: 'bg-slate-950 text-white hover:bg-slate-950',
}

export default function TeacherStatusBadge({ label, tone = 'neutral' }: TeacherStatusBadgeProps) {
  return <Badge className={`rounded-full ${toneClassName[tone]}`}>{label}</Badge>
}
