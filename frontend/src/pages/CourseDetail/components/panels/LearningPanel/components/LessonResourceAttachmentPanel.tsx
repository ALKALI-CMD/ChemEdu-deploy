import { Badge, Button } from '@/components/ui/UiComponents'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { attachmentTypeLabel, canPreviewUrl, previewLabel, text } from '../functions/lessonStudyUtils'

type LessonResourceAttachmentPanelProps = {
  lesson: Lesson
  onSelectPreview: (url: string, label: string) => void
  onOpenPreview: (detail: string) => void
}

export default function LessonResourceAttachmentPanel({
  lesson,
  onSelectPreview,
  onOpenPreview,
}: LessonResourceAttachmentPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">资源附件与预览</p>
      <div className="mt-3 space-y-3">
        {lesson.resourceAttachments.length > 0 ? (
          lesson.resourceAttachments.map((attachment, index) => (
            <div
              key={`${text(attachment.label)}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-950">{text(attachment.label)}</p>
                <p className="text-sm text-slate-500">
                  {attachmentTypeLabel(attachment.attachmentType)}
                  {attachment.sizeBytes ? ` / ${attachment.sizeBytes} bytes` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachment.url && canPreviewUrl(attachment.url) ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-slate-300 bg-white hover:bg-slate-100"
                    onClick={() => {
                      onSelectPreview(attachment.url, previewLabel(attachment.url))
                      onOpenPreview(`已打开：${text(attachment.label)}`)
                    }}
                  >
                    页内预览
                  </Button>
                ) : null}
                {attachment.url ? (
                  <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      下载附件
                    </a>
                  </Button>
                ) : (
                  <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">仅展示标签</Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">当前课时还没有额外的资源附件。</div>
        )}
      </div>
    </div>
  )
}
