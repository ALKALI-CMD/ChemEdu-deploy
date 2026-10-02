import type { RefObject } from 'react'
import type { Lesson } from '@/objects/course/catalog/Lesson'

import { formatSeconds } from '../functions/lessonStudyUtils'

type LessonVideoStudyPanelProps = {
  lesson: Lesson
  videoRef: RefObject<HTMLVideoElement | null>
  playbackRate: number
  positionDraft: number
  restoredLessonIdRef: RefObject<string | null>
  onPlaybackRateChange: (nextRate: number) => void
  onPlay: () => void
  onPause: () => void
  onEnded: () => void
  onPositionChange: (nextPositionSeconds: number) => void
  onRestoredPosition: (restoreSeconds: number) => void
}

export default function LessonVideoStudyPanel({
  lesson,
  videoRef,
  playbackRate,
  positionDraft,
  restoredLessonIdRef,
  onPlaybackRateChange,
  onPlay,
  onPause,
  onEnded,
  onPositionChange,
  onRestoredPosition,
}: LessonVideoStudyPanelProps) {
  if (!lesson.videoUrl) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-white">
        <span>视频学习区</span>
        <label className="flex items-center gap-2">
          <span className="text-slate-300">倍速</span>
          <select
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-white"
            value={playbackRate}
            onChange={(event) => onPlaybackRateChange(Number(event.target.value))}
          >
            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </select>
        </label>
      </div>
      <video
        ref={videoRef}
        className="w-full"
        controls
        preload="metadata"
        src={lesson.videoUrl}
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = playbackRate
          if (restoredLessonIdRef.current === lesson.id) return
          const restoreSeconds = lesson.studyRecord?.lastPositionSeconds ?? 0
          if (restoreSeconds > 0 && restoreSeconds < event.currentTarget.duration - 3) {
            event.currentTarget.currentTime = restoreSeconds
            onRestoredPosition(restoreSeconds)
          }
          restoredLessonIdRef.current = lesson.id
        }}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={(event) => {
          const nextTime = Math.floor(event.currentTarget.currentTime)
          if (Number.isFinite(nextTime)) onPositionChange(nextTime)
        }}
      />
      <p className="sr-only">当前位置：{formatSeconds(positionDraft)}</p>
    </div>
  )
}
