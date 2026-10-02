import { Badge, Button } from '@/components/ui/UiComponents'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { text } from '../functions/lessonStudyUtils'

export type LessonPreviewTarget = {
  id: string
  label: string
  url: string
}

type LessonResourcePreviewPanelProps = {
  lesson: Lesson
  selectedPreviewUrl: string | null
  selectedPreviewLabel: string
  previewError: string | null
  previewTargets: LessonPreviewTarget[]
  previewProgress: {
    total: number
    completed: number
  }
  needsPreviewCompletion: boolean
  onPreviewRead: (targetId: string, detail: string) => void
  onPreviewError: (message: string) => void
}

export default function LessonResourcePreviewPanel({
  lesson,
  selectedPreviewUrl,
  selectedPreviewLabel,
  previewError,
  previewTargets,
  previewProgress,
  needsPreviewCompletion,
  onPreviewRead,
  onPreviewError,
}: LessonResourcePreviewPanelProps) {
  const markSelectedPreviewRead = () => {
    const target = previewTargets.find((item) => item.url === selectedPreviewUrl)
    if (target) {
      onPreviewRead(target.id, `已完成预览：${target.label}`)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{selectedPreviewLabel || '资料预览'}</p>
        {selectedPreviewUrl ? (
          <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
            <a href={selectedPreviewUrl} target="_blank" rel="noreferrer">
              在新窗口打开
            </a>
          </Button>
        ) : null}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {selectedPreviewUrl ? (
          previewError ? (
            <div className="flex min-h-[220px] items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
              {previewError}
            </div>
          ) : /\.(png|jpe?g|gif|webp)$/i.test(selectedPreviewUrl) ? (
            <img
              src={selectedPreviewUrl}
              alt={selectedPreviewLabel}
              className="max-h-[360px] w-full object-contain"
              onLoad={markSelectedPreviewRead}
              onError={() => onPreviewError('当前资料暂时无法预览，你可以改用“在新窗口打开”或“下载附件”。')}
            />
          ) : (
            <iframe
              title={`${text(lesson.title)}-preview`}
              src={selectedPreviewUrl}
              className="h-[360px] w-full"
              onLoad={markSelectedPreviewRead}
            />
          )
        ) : (
          <div className="flex min-h-[220px] items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
            暂无可预览资料。
          </div>
        )}
      </div>
      {previewTargets.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
            资料阅读完成度 {previewProgress.completed}/{previewProgress.total}
          </Badge>
          {needsPreviewCompletion ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              完成全部可预览资料后，才能满足本课时的完整学习条件。
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">资料阅读条件已满足</span>
          )}
        </div>
      ) : null}
    </div>
  )
}
