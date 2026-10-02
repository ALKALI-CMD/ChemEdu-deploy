import type { WrongQuestionItem } from '../../../../hooks/useStudentCenterModel'

type MasteryRadarChartProps = {
  items: WrongQuestionItem[]
  resolvedMap: Record<string, boolean>
  questionTypeLabel: Record<string, string>
}

type RadarDatum = {
  type: string
  label: string
  total: number
  resolved: number
  mastery: number
}

function buildRadarData(
  items: WrongQuestionItem[],
  resolvedMap: Record<string, boolean>,
  questionTypeLabel: Record<string, string>,
): RadarDatum[] {
  const grouped = items.reduce<Record<string, { total: number; resolved: number }>>((acc, item) => {
    const current = acc[item.questionType] ?? { total: 0, resolved: 0 }
    current.total += 1
    current.resolved += resolvedMap[item.id] ? 1 : 0
    acc[item.questionType] = current
    return acc
  }, {})

  return Object.entries(grouped).map(([type, value]) => ({
    type,
    label: questionTypeLabel[type] ?? type,
    total: value.total,
    resolved: value.resolved,
    mastery: value.total === 0 ? 100 : Math.round((value.resolved / value.total) * 100),
  }))
}

function polarToPoint(center: number, radius: number, angle: number, valueRatio = 1) {
  const adjusted = angle - Math.PI / 2
  const distance = radius * valueRatio
  return {
    x: center + Math.cos(adjusted) * distance,
    y: center + Math.sin(adjusted) * distance,
  }
}

export default function MasteryRadarChart({ items, resolvedMap, questionTypeLabel }: MasteryRadarChartProps) {
  const data = buildRadarData(items, resolvedMap, questionTypeLabel)
  const center = 150
  const radius = 96
  const size = 300
  const angles = data.map((_, index) => (Math.PI * 2 * index) / Math.max(1, data.length))
  const polygon = data
    .map((item, index) => {
      const visibleRatio = Math.max(0.08, item.mastery / 100)
      const point = polarToPoint(center, radius, angles[index], visibleRatio)
      return `${point.x},${point.y}`
    })
    .join(' ')
  const pendingCount = items.filter((item) => !resolvedMap[item.id]).length
  const resolvedCount = items.length - pendingCount

  return (
    <div className="animate-fade-up grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <p className="text-sm font-semibold text-slate-950">知识点掌握雷达图</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">已掌握</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{resolvedCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">待巩固</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl bg-white text-sm text-slate-500">
          暂无错题记录。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[300px_1fr] md:items-center">
          <svg className="h-[300px] w-[300px]" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="知识点掌握雷达图">
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const points = angles.map((angle) => {
                const point = polarToPoint(center, radius, angle, ratio)
                return `${point.x},${point.y}`
              })
              return <polygon key={ratio} points={points.join(' ')} fill="none" stroke="#dbe4ee" strokeDasharray="4 4" />
            })}
            {angles.map((angle, index) => {
              const axisEnd = polarToPoint(center, radius, angle)
              const labelPoint = polarToPoint(center, radius + 28, angle)
              return (
                <g key={data[index].type}>
                  <line x1={center} y1={center} x2={axisEnd.x} y2={axisEnd.y} stroke="#cbd5e1" />
                  <text x={labelPoint.x} y={labelPoint.y + 4} textAnchor="middle" className="fill-slate-600 text-[11px]">
                    {data[index].label}
                  </text>
                </g>
              )
            })}
            <polygon points={polygon} fill="rgba(14, 165, 233, 0.18)" stroke="#0ea5e9" strokeWidth={3} />
            {data.map((item, index) => {
              const visibleRatio = Math.max(0.08, item.mastery / 100)
              const point = polarToPoint(center, radius, angles[index], visibleRatio)
              return (
                <g key={item.type}>
                  <circle cx={point.x} cy={point.y} r={5} fill="#0ea5e9" />
                  <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
                    {item.mastery}%
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="grid gap-2">
            {data.map((item) => (
              <div key={item.type} className="rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-950">{item.label}</p>
                  <p className="text-sm text-slate-500">
                    {item.resolved} / {item.total}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="progress-shine h-full rounded-full bg-sky-500" style={{ width: `${item.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
