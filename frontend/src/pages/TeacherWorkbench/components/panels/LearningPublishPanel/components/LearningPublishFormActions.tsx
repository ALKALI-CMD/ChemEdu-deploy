import { Button } from '@/components/ui/UiComponents'

type LearningPublishFormActionsProps = {
  publishing: boolean
  disablePublish: boolean
  previewLabel: string
  publishLabel: string
  onPreview: () => void
  onPublish: () => void
}

export default function LearningPublishFormActions({
  publishing,
  disablePublish,
  previewLabel,
  publishLabel,
  onPreview,
  onPublish,
}: LearningPublishFormActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
        onClick={onPreview}
      >
        {previewLabel}
      </Button>
      <Button
        type="button"
        className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
        disabled={publishing || disablePublish}
        onClick={onPublish}
      >
        {publishLabel}
      </Button>
    </div>
  )
}
