// 文件说明：教研端改题区域编辑器，在答题卡样卷上拖拽划定每道题的判分区域。
import { useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { readImageAsCompressedDataUrl } from '@/lib/sheetImage'
import type { Exam } from '@/objects/exam/Exam'
import type { GradingRegion } from '@/objects/exam/GradingRegion'

type RegionEditorDialogProps = {
  exam: Exam
  initialImage: string | null
  onClose: () => void
  onSave: (regions: Record<string, GradingRegion>, sheetTemplateImage: string | null) => Promise<void>
}

export default function RegionEditorDialog({ exam, initialImage, onClose, onSave }: RegionEditorDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [regions, setRegions] = useState<Record<string, GradingRegion>>(exam.gradingRegions)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    exam.questions.find((question) => !exam.gradingRegions[question.id])?.id ?? null,
  )
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)

  const toRelative = (event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!activeQuestionId) {
      setError('所有题目都已有区域；如需重划，请先删除对应区域。')
      return
    }
    drawStartRef.current = toRelative(event)
    setDraftRect({ x: drawStartRef.current.x, y: drawStartRef.current.y, w: 0, h: 0 })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!drawStartRef.current) return
    const current = toRelative(event)
    const start = drawStartRef.current
    setDraftRect({
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      w: Math.abs(current.x - start.x),
      h: Math.abs(current.y - start.y),
    })
  }

  const handleMouseUp = () => {
    const start = drawStartRef.current
    drawStartRef.current = null
    if (!start || !draftRect || !activeQuestionId) {
      setDraftRect(null)
      return
    }
    if (draftRect.w < 0.01 || draftRect.h < 0.01) {
      setDraftRect(null)
      return
    }
    setRegions((current) => ({
      ...current,
      [activeQuestionId]: { x: draftRect.x, y: draftRect.y, w: draftRect.w, h: draftRect.h },
    }))
    setDraftRect(null)
    const nextQuestion = exam.questions.find(
      (question) => question.id !== activeQuestionId && !regions[question.id] && question.id !== activeQuestionId,
    )
    setActiveQuestionId(nextQuestion?.id ?? null)
  }

  const handleTemplateUpload = async (file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await readImageAsCompressedDataUrl(file)
      setImageUrl(dataUrl)
      setUploadedImage(dataUrl)
      setError(null)
    } catch (uploadCatch) {
      setError(uploadCatch instanceof Error ? uploadCatch.message : '样卷图片读取失败。')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(regions, uploadedImage)
      onClose()
    } catch (saveCatch) {
      setError(saveCatch instanceof Error ? saveCatch.message : '保存失败，请重试。')
    } finally {
      setSaving(false)
    }
  }

  const unsavedRegions = Object.keys(regions).filter((questionId) => regions[questionId] !== exam.gradingRegions[questionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">划分改题区域 · {exam.name}</h3>
            <p className="text-xs text-slate-500">
              在样卷上按住鼠标拖拽画出矩形，即可为当前选中题目划定区域；同一考试的所有答题卡共用这套区域。
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-700">
            <Upload className="h-3.5 w-3.5" /> 上传样卷
            <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleTemplateUpload(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_240px]">
          <div>
            {imageUrl ? (
              <div
                ref={containerRef}
                className="relative select-none overflow-hidden rounded-xl border border-slate-200"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  drawStartRef.current = null
                  setDraftRect(null)
                }}
              >
                <img src={imageUrl} alt="答题卡样卷" className="block w-full" draggable={false} />
                {Object.entries(regions).map(([questionId, region]) => {
                  const question = exam.questions.find((item) => item.id === questionId)
                  const isActive = questionId === activeQuestionId
                  return (
                    <div
                      key={questionId}
                      className={`absolute border-2 ${isActive ? 'border-amber-500 bg-amber-400/20' : 'border-sky-600/70 bg-sky-400/10'}`}
                      style={{
                        left: `${region.x * 100}%`,
                        top: `${region.y * 100}%`,
                        width: `${region.w * 100}%`,
                        height: `${region.h * 100}%`,
                      }}
                    >
                      <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        第 {question?.orderIndex ?? '?'} 题
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setRegions((current) => {
                              const next = { ...current }
                              delete next[questionId]
                              return next
                            })
                            setActiveQuestionId(questionId)
                          }}
                          className="text-rose-300 hover:text-rose-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  )
                })}
                {draftRect && (
                  <div
                    className="absolute border-2 border-dashed border-amber-500 bg-amber-400/20"
                    style={{
                      left: `${draftRect.x * 100}%`,
                      top: `${draftRect.y * 100}%`,
                      width: `${draftRect.w * 100}%`,
                      height: `${draftRect.h * 100}%`,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                请先上传一张答题卡样卷（或使用助教已上传的答题卡）。
                <label className="cursor-pointer rounded-lg bg-sky-900 px-4 py-2 text-sm font-semibold text-white">
                  选择样卷图片
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleTemplateUpload(event.target.files?.[0] ?? null)} />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">题目清单（当前选中：{exam.questions.find((q) => q.id === activeQuestionId)?.orderIndex ?? '无'}）</p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {exam.questions.map((question) => {
                const hasRegion = Boolean(regions[question.id])
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setActiveQuestionId(question.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs ${
                      question.id === activeQuestionId ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-slate-700">第 {question.orderIndex} 题 · {question.topicTag}</span>
                    <span className={hasRegion ? 'text-emerald-700' : 'text-slate-400'}>{hasRegion ? '已划区' : '待划区'}</span>
                  </button>
                )
              })}
            </div>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600">
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-lg bg-sky-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
              >
                {saving ? '保存中…' : `保存区域（${Object.keys(regions).length}${unsavedRegions.length > 0 ? '，有改动' : ''}）`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
