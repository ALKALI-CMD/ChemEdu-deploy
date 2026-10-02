type GradebookMetricProps = {
  label: string
  value: string | number
}

export default function GradebookMetric({ label, value }: GradebookMetricProps) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
