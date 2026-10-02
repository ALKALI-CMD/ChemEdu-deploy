import { Button } from '@/components/ui/UiComponents'
import type { getQuestionSummary } from '../functions/structuredQuizQuestionModel'

type StructuredQuizQuestionEditorHeaderProps = {
  summary: ReturnType<typeof getQuestionSummary>
  hasQuestions: boolean
  onImport: () => void
  onExport: () => void
}

export default function StructuredQuizQuestionEditorHeader({
  summary,
  hasQuestions,
  onImport,
  onExport,
}: StructuredQuizQuestionEditorHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">结构化题库编辑</p>
          <p className="text-xs leading-6 text-slate-500">
            支持题目分值、拖拽排序、复制、导入和导出。结构化编辑的内容会自动同步到发布用题库。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">客观题 {summary.objective}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">主观题 {summary.subjective}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">总分值 {summary.totalPoints}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onImport}>
          导入题库
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onExport}
          disabled={!hasQuestions}
        >
          导出题库
        </Button>
      </div>
    </>
  )
}
