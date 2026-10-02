import { useState } from 'react'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea } from '@/components/ui/UiComponents'
import { categoryOptions, gradeOptions, scheduleOptions } from '@/components/course-editor/courseEditorOptions'
import { fileToDataUrl, readCourseCover, saveCourseCover } from '@/lib/local-media'

function cleanText(value: string) {
  return value.trim()
}

const coverOutputWidth = 640
const coverOutputHeight = 360

function clampCoverFocus(value: number) {
  return Math.min(100, Math.max(0, value))
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('封面图片读取失败，请重新选择图片。'))
    image.src = source
  })
}

async function cropCoverImage(source: string, focusXPercent: number, focusYPercent: number) {
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = coverOutputWidth
  canvas.height = coverOutputHeight
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('当前浏览器无法裁剪课程封面。')
  }

  const scale = Math.max(coverOutputWidth / image.width, coverOutputHeight / image.height)
  const scaledWidth = image.width * scale
  const scaledHeight = image.height * scale
  const maxOffsetX = Math.max(0, scaledWidth - coverOutputWidth)
  const maxOffsetY = Math.max(0, scaledHeight - coverOutputHeight)
  const drawX = -maxOffsetX * (clampCoverFocus(focusXPercent) / 100)
  const drawY = -maxOffsetY * (clampCoverFocus(focusYPercent) / 100)

  context.fillStyle = '#f8fafc'
  context.fillRect(0, 0, coverOutputWidth, coverOutputHeight)
  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight)

  return canvas.toDataURL('image/jpeg', 0.92)
}

type BasicSettingsStepProps = {
  title: string
  form: CourseEditorInput
  setForm: React.Dispatch<React.SetStateAction<CourseEditorInput>>
  fieldErrors?: Partial<Record<'title' | 'category' | 'grade' | 'schedule' | 'price' | 'description', string>>
}

export default function BasicSettingsStep({ title, form, setForm, fieldErrors = {} }: BasicSettingsStepProps) {
  const coverKey = String(form.title || title)
  const [cover, setCover] = useState<string | null>(() => form.coverImageUrl ?? readCourseCover(coverKey))
  const [coverCropSource, setCoverCropSource] = useState<string | null>(null)
  const [coverFocus, setCoverFocus] = useState({ x: 50, y: 50 })
  const [coverDragStart, setCoverDragStart] = useState<{ pointerX: number; pointerY: number; focusX: number; focusY: number } | null>(null)
  const [coverSaving, setCoverSaving] = useState(false)

  async function handleCoverSelect(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setCoverCropSource(dataUrl)
    setCoverFocus({ x: 50, y: 50 })
  }

  async function handleSaveCover() {
    if (!coverCropSource) return
    setCoverSaving(true)
    try {
      const croppedCover = await cropCoverImage(coverCropSource, coverFocus.x, coverFocus.y)
      saveCourseCover(coverKey, croppedCover)
      setCover(croppedCover)
      setForm((prev) => ({ ...prev, coverImageUrl: croppedCover }))
      setCoverCropSource(null)
    } finally {
      setCoverSaving(false)
    }
  }

  function handleCoverDrag(clientX: number, clientY: number) {
    if (!coverDragStart) return
    setCoverFocus({
      x: clampCoverFocus(coverDragStart.focusX - (clientX - coverDragStart.pointerX) / 3),
      y: clampCoverFocus(coverDragStart.focusY - (clientY - coverDragStart.pointerY) / 3),
    })
  }

  return (
    <>
    <div className="space-y-5">
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[168px_minmax(0,1fr)]">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-white shadow-sm">
          {cover ? (
            <img src={cover} alt="课程封面" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">未上传封面</div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div>
            <p className="font-medium text-slate-950">课程封面（选填）</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              封面会在课程卡片和课程详情左侧以小图展示，不再作为大幅横图占满页面。
            </p>
          </div>
          <label className="w-fit cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
            上传封面图片
            <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleCoverSelect(event.target.files)} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-title`}>课程标题（必填）</Label>
          <Input
            id={`${title}-course-title`}
            required
            aria-required="true"
            placeholder="例如：TypeScript 全栈开发"
            value={form.title}
            aria-invalid={Boolean(fieldErrors.title)}
            onChange={(event) => setForm((prev) => ({ ...prev, title: cleanText(event.target.value) }))}
          />
          {fieldErrors.title ? <p className="text-xs leading-5 text-red-600">{fieldErrors.title}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-subtitle`}>课程副标题（选填）</Label>
          <Input
            id={`${title}-course-subtitle`}
            placeholder="例如：从类型建模到项目交付"
            value={form.subtitle}
            onChange={(event) => setForm((prev) => ({ ...prev, subtitle: cleanText(event.target.value) }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-category`}>课程分类（必填）</Label>
          <select
            id={`${title}-course-category`}
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.category)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 aria-invalid:border-red-500"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: cleanText(event.target.value) }))}
          >
            <option value="">请选择课程分类</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.category ? <p className="text-xs leading-5 text-red-600">{fieldErrors.category}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-grade`}>适用年级（必填）</Label>
          <select
            id={`${title}-course-grade`}
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.grade)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 aria-invalid:border-red-500"
            value={form.grade}
            onChange={(event) => setForm((prev) => ({ ...prev, grade: event.target.value.trim() }))}
          >
            <option value="">请选择适用年级</option>
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.grade ? <p className="text-xs leading-5 text-red-600">{fieldErrors.grade}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-schedule`}>上课时间（必填）</Label>
          <select
            id={`${title}-course-schedule`}
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.schedule)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 aria-invalid:border-red-500"
            value={form.schedule}
            onChange={(event) => setForm((prev) => ({ ...prev, schedule: cleanText(event.target.value) }))}
          >
            <option value="">请选择上课时间</option>
            {scheduleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.schedule ? <p className="text-xs leading-5 text-red-600">{fieldErrors.schedule}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-price`}>课程价格（必填，元）</Label>
          <Input
            id={`${title}-course-price`}
            required
            aria-required="true"
            type="number"
            min={0}
            step={10}
            value={form.price}
            aria-invalid={Boolean(fieldErrors.price)}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))}
          />
          {fieldErrors.price ? <p className="text-xs leading-5 text-red-600">{fieldErrors.price}</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${title}-course-description`}>课程简介（必填）</Label>
        <Textarea
          id={`${title}-course-description`}
          required
          aria-required="true"
          placeholder="介绍课程目标、学习内容和适合人群"
          value={form.description}
          aria-invalid={Boolean(fieldErrors.description)}
          onChange={(event) => setForm((prev) => ({ ...prev, description: cleanText(event.target.value) }))}
        />
        {fieldErrors.description ? <p className="text-xs leading-5 text-red-600">{fieldErrors.description}</p> : null}
      </div>
    </div>
    <Dialog open={Boolean(coverCropSource)} onOpenChange={(open) => {
      if (!open) {
        setCoverCropSource(null)
        setCoverDragStart(null)
      }
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>调整课程封面</DialogTitle>
          <DialogDescription>直接拖拽图片调整显示区域，保存后会用于课程卡片和课程详情左侧小封面。</DialogDescription>
        </DialogHeader>

        <div
          className="relative aspect-[16/9] cursor-grab overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 active:cursor-grabbing"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setCoverDragStart({
              pointerX: event.clientX,
              pointerY: event.clientY,
              focusX: coverFocus.x,
              focusY: coverFocus.y,
            })
          }}
          onPointerMove={(event) => handleCoverDrag(event.clientX, event.clientY)}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId)
            setCoverDragStart(null)
          }}
          onPointerCancel={() => setCoverDragStart(null)}
        >
          {coverCropSource ? (
            <img
              src={coverCropSource}
              alt="课程封面裁剪预览"
              className="h-full w-full select-none object-cover"
              draggable={false}
              style={{ objectPosition: `${coverFocus.x}% ${coverFocus.y}%` }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/70" />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          提示：按住图片向左、向右、向上或向下拖动即可调整裁剪位置。
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setCoverCropSource(null)} disabled={coverSaving}>
            取消
          </Button>
          <Button type="button" onClick={() => void handleSaveCover()} disabled={coverSaving}>
            {coverSaving ? '保存中...' : '保存封面'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
