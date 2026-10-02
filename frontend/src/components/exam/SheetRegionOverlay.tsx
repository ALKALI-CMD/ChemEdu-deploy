// 文件说明：考试评定域答题卡查看器，在答题卡图片上叠加改题区域并支持选中高亮。
import type { GradingRegion } from '@/objects/exam/GradingRegion'

export type SheetRegionTone = 'neutral' | 'selected' | 'graded' | 'partial' | 'argued'

const toneStyles: Record<SheetRegionTone, string> = {
  neutral: 'border-dashed border-sky-600/70 bg-sky-500/5 hover:bg-sky-500/15',
  selected: 'border-solid border-amber-500 bg-amber-400/20',
  graded: 'border-solid border-emerald-500 bg-emerald-400/10',
  partial: 'border-solid border-sky-500 bg-sky-400/10',
  argued: 'border-solid border-rose-500 bg-rose-400/15',
}

type SheetRegionOverlayProps = {
  imageUrl: string
  regions: Record<string, GradingRegion>
  regionTones?: Record<string, SheetRegionTone>
  regionLabels?: Record<string, string>
  selectedQuestionId?: string | null
  onSelectRegion?: (questionId: string) => void
  emptyHint?: string
}

export default function SheetRegionOverlay({
  imageUrl,
  regions,
  regionTones = {},
  regionLabels = {},
  selectedQuestionId,
  onSelectRegion,
  emptyHint = '本场考试尚未划分改题区域。',
}: SheetRegionOverlayProps) {
  const regionEntries = Object.entries(regions)

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <img src={imageUrl} alt="答题卡" className="block h-auto w-full select-none" draggable={false} />
      {regionEntries.length === 0 && (
        <p className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-3 py-2 text-center text-xs text-slate-100">
          {emptyHint}
        </p>
      )}
      {regionEntries.map(([questionId, region]) => {
        const tone: SheetRegionTone = questionId === selectedQuestionId ? 'selected' : regionTones[questionId] ?? 'neutral'
        return (
          <button
            key={questionId}
            type="button"
            onClick={onSelectRegion ? () => onSelectRegion(questionId) : undefined}
            className={`absolute rounded-md border-2 transition ${toneStyles[tone]} ${
              onSelectRegion ? 'cursor-pointer' : 'cursor-default pointer-events-none'
            }`}
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.w * 100}%`,
              height: `${region.h * 100}%`,
            }}
            title={regionLabels[questionId] ?? questionId}
          >
            <span className="absolute left-1 top-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {regionLabels[questionId] ?? questionId}
            </span>
          </button>
        )
      })}
    </div>
  )
}
