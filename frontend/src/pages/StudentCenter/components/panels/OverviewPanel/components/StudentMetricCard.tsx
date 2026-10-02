import { MetricCard } from '@/components/education/DisplayPrimitives'

type StudentMetricCardProps = {
  className: string
  eyebrow: string
  value: string | number
  description: string
}

export default function StudentMetricCard({ className, eyebrow, value, description }: StudentMetricCardProps) {
  return (
    <MetricCard
      className={className}
      label={eyebrow}
      value={value}
      description={description}
      labelClassName={className.includes('text-white') ? 'text-slate-300' : undefined}
      valueClassName={className.includes('text-white') ? 'text-white' : undefined}
    />
  )
}
