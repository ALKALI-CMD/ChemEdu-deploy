import { MetricCard } from '@/components/education/DisplayPrimitives'

type TeacherMetricCardProps = {
  label: string
  value: number
  cardClassName: string
  labelClassName: string
  valueClassName?: string
}

export default function TeacherMetricCard({
  label,
  value,
  cardClassName,
  labelClassName,
  valueClassName = 'text-slate-950',
}: TeacherMetricCardProps) {
  return (
    <MetricCard
      className={cardClassName}
      label={label}
      value={value}
      labelClassName={labelClassName}
      valueClassName={valueClassName}
    />
  )
}
