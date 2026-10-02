import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/UiComponents'

type ChartPanelProps = {
  title: string
  description: string
  children: ReactNode
}

function ChartPanel({ title, children }: ChartPanelProps) {
  return (
    <Card className="motion-card animate-fade-up border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">{title}</p>
        </div>
        <div className="h-72 min-w-0">{children}</div>
      </CardContent>
    </Card>
  )
}

type ScoreTrendDatum = {
  label: string
  score: number
  type: string
}

function ScoreTrendChart({ data }: { data: ScoreTrendDatum[] }) {
  const width = 640
  const height = 240
  const padding = { top: 20, right: 28, bottom: 44, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth
  const points = data.map((item, index) => {
    const x = padding.left + (data.length > 1 ? index * xStep : plotWidth / 2)
    const y = padding.top + plotHeight - (Math.max(0, Math.min(100, item.score)) / 100) * plotHeight
    return { ...item, x, y }
  })
  const path = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="成绩趋势折线图">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padding.top + plotHeight - (tick / 100) * plotHeight
        return (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">
              {tick}
            </text>
          </g>
        )
      })}
      <polyline points={path} fill="none" stroke="#0ea5e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
      {points.map((point) => (
        <g key={`${point.label}-${point.x}`}>
          <circle cx={point.x} cy={point.y} r={5} fill="#0ea5e9" />
          <text x={point.x} y={height - 18} textAnchor="middle" className="fill-slate-500 text-[11px]">
            {point.label}
          </text>
          <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
            {point.score}
          </text>
        </g>
      ))}
    </svg>
  )
}

type BarDatum = {
  label: string
  value: number
  fill?: string
}

const defaultBarColors = ['#0f172a', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e']

function SimpleBarChart({ data }: { data: BarDatum[] }) {
  const width = 640
  const height = 240
  const padding = { top: 20, right: 28, bottom: 44, left: 42 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(1, ...data.map((item) => item.value))
  const barGap = 18
  const barWidth = data.length > 0 ? (plotWidth - barGap * (data.length - 1)) / data.length : plotWidth

  return (
    <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="数量柱状图">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const value = Math.round(maxValue * ratio)
        const y = padding.top + plotHeight - ratio * plotHeight
        return (
          <g key={ratio}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">
              {value}
            </text>
          </g>
        )
      })}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * plotHeight
        const x = padding.left + index * (barWidth + barGap)
        const y = padding.top + plotHeight - barHeight
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={8}
              fill={item.fill ?? defaultBarColors[index % defaultBarColors.length]}
            />
            <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" className="fill-slate-700 text-[12px] font-medium">
              {item.value}
            </text>
            <text x={x + barWidth / 2} y={height - 18} textAnchor="middle" className="fill-slate-500 text-[12px]">
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export { ChartPanel, ScoreTrendChart, SimpleBarChart }
export type { BarDatum, ScoreTrendDatum }
