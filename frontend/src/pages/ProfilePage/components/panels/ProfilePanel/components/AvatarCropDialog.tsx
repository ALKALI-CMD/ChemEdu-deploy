import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui/UiComponents'

type AvatarCropDialogProps = {
  source: string | null
  cropX: number
  cropY: number
  cropZoom: number
  saving: boolean
  onOpenChange: (open: boolean) => void
  onCropXChange: (value: number) => void
  onCropYChange: (value: number) => void
  onCropZoomChange: (value: number) => void
  onSave: () => void
}

export default function AvatarCropDialog({
  source,
  cropX,
  cropY,
  cropZoom,
  saving,
  onOpenChange,
  onCropXChange,
  onCropYChange,
  onCropZoomChange,
  onSave,
}: AvatarCropDialogProps) {
  return (
    <Dialog open={Boolean(source)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle>裁剪头像</DialogTitle>
          <DialogDescription>调整图片位置和大小，保存后会作为个人头像显示。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="mx-auto h-72 w-72 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
            {source ? (
              <img
                src={source}
                alt="头像裁剪预览"
                className="h-full w-full object-cover"
                style={{
                  objectPosition: `${cropX}% ${cropY}%`,
                  transform: `scale(${cropZoom})`,
                  transformOrigin: `${cropX}% ${cropY}%`,
                }}
              />
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="avatar-zoom">缩放</Label>
              <Input
                id="avatar-zoom"
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropZoom}
                onChange={(event) => onCropZoomChange(Number(event.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar-x">水平位置</Label>
              <Input
                id="avatar-x"
                type="range"
                min="0"
                max="100"
                step="1"
                value={cropX}
                onChange={(event) => onCropXChange(Number(event.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar-y">垂直位置</Label>
              <Input
                id="avatar-y"
                type="range"
                min="0"
                max="100"
                step="1"
                value={cropY}
                onChange={(event) => onCropYChange(Number(event.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? '保存中...' : '保存头像'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
