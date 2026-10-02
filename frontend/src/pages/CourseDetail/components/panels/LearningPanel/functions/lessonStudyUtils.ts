import { LessonContentType } from '@/objects/course/catalog/LessonContentType'
import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'

export type SessionEvent = {
  id: string
  label: string
  detail: string
  createdAt: string
  kind: 'video' | 'reading' | 'progress' | 'complete'
}

export const playbackSpeedStorageKey = 'education-lesson-playback-speed'

export function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export function formatSeconds(totalSeconds?: number) {
  const seconds = Math.max(0, totalSeconds ?? 0)
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${minutes} 分 ${String(remainSeconds).padStart(2, '0')} 秒`
}

export function contentTypeLabel(contentType: LessonContentType) {
  switch (contentType) {
    case LessonContentType.Video:
      return '视频导学'
    case LessonContentType.Slides:
      return '课件讲义'
    case LessonContentType.Download:
      return '下载资料'
    case LessonContentType.RichText:
    default:
      return '正文内容'
  }
}

export function attachmentTypeLabel(type: AssignmentAttachmentType) {
  switch (type) {
    case AssignmentAttachmentType.Review:
      return '反馈附件'
    case AssignmentAttachmentType.Submission:
      return '提交附件'
    case AssignmentAttachmentType.Reference:
    default:
      return '课程资料'
  }
}

export function canPreviewUrl(url?: string) {
  if (!url) return false
  return /\.(pdf|png|jpe?g|gif|webp|txt|md)$/i.test(url) || url.includes('preview') || url.includes('viewer')
}

export function previewLabel(url?: string) {
  if (!url) return ''
  if (/\.(png|jpe?g|gif|webp)$/i.test(url)) return '图片预览'
  if (/\.pdf$/i.test(url)) return 'PDF 预览'
  return '文档预览'
}

export function timelineLabel(eventType: string) {
  switch (eventType) {
    case 'completed':
      return '完成课时'
    case 'study_recorded':
      return '累计学习'
    case 'resource_preview_completed':
      return '完成资料阅读'
    case 'playback_rate_changed':
      return '调整播放倍速'
    case 'video_played':
      return '开始视频学习'
    case 'video_paused':
      return '暂停视频学习'
    case 'manual_progress_saved':
      return '手动保存进度'
    case 'threshold_reached':
      return '达到完成阈值'
    case 'position_saved':
    default:
      return '保存学习位置'
  }
}

export function timelineKind(eventType: string): SessionEvent['kind'] {
  switch (eventType) {
    case 'resource_preview_completed':
      return 'reading'
    case 'completed':
    case 'threshold_reached':
      return 'complete'
    case 'video_played':
    case 'video_paused':
    case 'playback_rate_changed':
      return 'video'
    default:
      return 'progress'
  }
}

export function kindDotClass(kind: SessionEvent['kind']) {
  switch (kind) {
    case 'video':
      return 'bg-sky-500'
    case 'reading':
      return 'bg-amber-500'
    case 'complete':
      return 'bg-emerald-500'
    case 'progress':
    default:
      return 'bg-slate-500'
  }
}

export function readPlaybackSpeed() {
  const raw = window.localStorage.getItem(playbackSpeedStorageKey)
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}
