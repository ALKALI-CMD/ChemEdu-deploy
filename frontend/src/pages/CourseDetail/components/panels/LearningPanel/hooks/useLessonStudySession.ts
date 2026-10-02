import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import {
  canPreviewUrl,
  formatSeconds,
  playbackSpeedStorageKey,
  previewLabel,
  readPlaybackSpeed,
  text,
  timelineKind,
  timelineLabel,
  type SessionEvent,
} from '../functions/lessonStudyUtils'

type RecordLessonStudy = (
  lessonId: string,
  completed: boolean,
  studyMinutes: number,
  lastPositionSeconds?: number,
  options?: {
    silent?: boolean
    completedPreviewResourceIds?: string[]
    playbackRate?: number
    eventType?: string
  },
) => Promise<void>

export function useLessonStudySession(lesson: Lesson | null, canStudy: boolean, onRecordLessonStudy: RecordLessonStudy) {
  const [submittingAction, setSubmittingAction] = useState<string | null>(null)
  const [positionDraft, setPositionDraft] = useState(0)
  const [pendingStudySeconds, setPendingStudySeconds] = useState(0)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null)
  const [selectedPreviewLabel, setSelectedPreviewLabel] = useState('')
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(() => readPlaybackSpeed())
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([])
  const [completedPreviewIds, setCompletedPreviewIds] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const restoredLessonIdRef = useRef<string | null>(null)

  const currentLesson = lesson
  const studyRecord = currentLesson?.studyRecord

  const previewTargets = useMemo(() => {
    if (!currentLesson) return []
    const targets: Array<{ id: string; label: string; url: string }> = []
    if (currentLesson.documentUrl && canPreviewUrl(currentLesson.documentUrl)) {
      targets.push({ id: `document:${currentLesson.documentUrl}`, label: '课件预览', url: currentLesson.documentUrl })
    }
    currentLesson.resourceAttachments.forEach((attachment, index) => {
      if (attachment.url && canPreviewUrl(attachment.url)) {
        targets.push({
          id: `attachment:${index}:${attachment.url}`,
          label: text(attachment.label),
          url: attachment.url,
        })
      }
    })
    return targets
  }, [currentLesson])

  const previewProgress = useMemo(() => {
    const total = previewTargets.length
    const completed = previewTargets.filter((target) => completedPreviewIds.includes(target.id)).length
    return { total, completed }
  }, [completedPreviewIds, previewTargets])

  const totalTrackedStudyMinutes = useMemo(() => {
    const baseMinutes = studyRecord?.studyMinutes ?? 0
    return baseMinutes + Math.floor(pendingStudySeconds / 60)
  }, [pendingStudySeconds, studyRecord?.studyMinutes])

  const requiredStudyMinutes = currentLesson?.requiredStudyMinutes ?? 0
  const remainingStudyMinutes = Math.max(0, requiredStudyMinutes - totalTrackedStudyMinutes)
  const needsPreviewCompletion = previewProgress.total > 0 && previewProgress.completed < previewProgress.total
  const hasVideo = Boolean(currentLesson?.videoUrl)
  const canCompleteLesson =
    Boolean(currentLesson) &&
    canStudy &&
    !(currentLesson?.isLocked ?? true) &&
    (!hasVideo || (remainingStudyMinutes <= 0 && !needsPreviewCompletion))

  const combinedTimeline = useMemo(() => {
    const persisted =
      studyRecord?.recentTimeline.map((entry) => ({
        id: entry.id,
        label: timelineLabel(entry.eventType),
        detail:
          entry.eventType === 'study_recorded'
            ? `累计 ${entry.studyMinutesDelta} 分钟，位置 ${formatSeconds(entry.lastPositionSeconds)}`
            : `${entry.studyMinutesDelta > 0 ? `+${entry.studyMinutesDelta} 分钟 / ` : ''}位置 ${formatSeconds(entry.lastPositionSeconds)}`,
        createdAt: entry.recordedAt,
        kind: timelineKind(entry.eventType),
      })) ?? []

    return [...sessionEvents, ...persisted]
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
      .slice(0, 12)
  }, [sessionEvents, studyRecord?.recentTimeline])

  const behaviorSummary = useMemo(() => {
    const allEvents = combinedTimeline
    return {
      pauseCount: allEvents.filter((event) => event.label.includes('暂停')).length,
      playCount: allEvents.filter((event) => event.label.includes('开始视频')).length,
      previewCount: allEvents.filter((event) => event.kind === 'reading').length,
      saveCount: allEvents.filter((event) => event.label.includes('保存')).length,
    }
  }, [combinedTimeline])

  const pushSessionEvent = useCallback((label: string, detail: string, kind: SessionEvent['kind']) => {
    setSessionEvents((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        detail,
        kind,
        createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...current,
    ].slice(0, 8))
  }, [])

  useEffect(() => {
    setPositionDraft(lesson?.studyRecord?.lastPositionSeconds ?? 0)
    setPendingStudySeconds(0)
    setIsVideoPlaying(false)
    setPreviewError(null)
    setSessionEvents([])
    setCompletedPreviewIds(lesson?.studyRecord?.completedPreviewResourceIds ?? [])
    setPlaybackRate(lesson?.studyRecord?.playbackRate && lesson.studyRecord.playbackRate > 0 ? lesson.studyRecord.playbackRate : readPlaybackSpeed())
    lastTickRef.current = null
    restoredLessonIdRef.current = null

    if (lesson?.documentUrl) {
      setSelectedPreviewUrl(lesson.documentUrl)
      setSelectedPreviewLabel('课件预览')
      return
    }

    const firstPreviewableAttachment = lesson?.resourceAttachments.find((attachment) => canPreviewUrl(attachment.url))
    if (firstPreviewableAttachment) {
      setSelectedPreviewUrl(firstPreviewableAttachment.url)
      setSelectedPreviewLabel(previewLabel(firstPreviewableAttachment.url))
      return
    }

    setSelectedPreviewUrl(null)
    setSelectedPreviewLabel('')
  }, [lesson?.id, lesson?.studyRecord?.lastPositionSeconds, lesson?.studyRecord?.completedPreviewResourceIds, lesson?.studyRecord?.playbackRate, lesson?.documentUrl, lesson?.resourceAttachments])

  useEffect(() => {
    window.localStorage.setItem(playbackSpeedStorageKey, String(playbackRate))
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const flushPendingProgress = useCallback(
    async (reason: 'pause' | 'switch' | 'before-unload' | 'manual') => {
      if (!currentLesson || !canStudy || submittingAction !== null) return

      const studyMinutesDelta = Math.floor(pendingStudySeconds / 60)
      const nextPosition = Math.max(0, positionDraft)
      if (studyMinutesDelta <= 0 && reason !== 'manual') return
      if (studyMinutesDelta <= 0 && nextPosition === (currentLesson.studyRecord?.lastPositionSeconds ?? 0)) return

      setSubmittingAction(reason)
      try {
        await onRecordLessonStudy(currentLesson.id, currentLesson.completed, Math.max(0, studyMinutesDelta), nextPosition, {
          silent: reason !== 'manual',
          completedPreviewResourceIds: completedPreviewIds,
          playbackRate,
          eventType: reason === 'manual' ? 'manual_progress_saved' : 'position_saved',
        })
        setPendingStudySeconds((current) => Math.max(0, current - studyMinutesDelta * 60))
        if (studyMinutesDelta > 0) {
          pushSessionEvent('学习进度已同步', `补记 ${studyMinutesDelta} 分钟，当前位置 ${formatSeconds(nextPosition)}`, 'progress')
        } else {
          pushSessionEvent('学习位置已保存', `当前位置 ${formatSeconds(nextPosition)}`, 'progress')
        }
      } finally {
        setSubmittingAction(null)
      }
    },
    [canStudy, completedPreviewIds, currentLesson, onRecordLessonStudy, pendingStudySeconds, playbackRate, positionDraft, pushSessionEvent, submittingAction],
  )

  const markPreviewAsRead = useCallback(
    (targetId: string, detail: string) => {
      if (!currentLesson) return
      setCompletedPreviewIds((current) => {
        if (current.includes(targetId)) return current
        const next = [...current, targetId]
        pushSessionEvent('资料阅读已完成', detail, 'reading')
        void onRecordLessonStudy(currentLesson.id, currentLesson.completed, 0, positionDraft, {
          silent: true,
          completedPreviewResourceIds: next,
          playbackRate,
          eventType: 'resource_preview_completed',
        })
        return next
      })
    },
    [currentLesson, onRecordLessonStudy, playbackRate, positionDraft, pushSessionEvent],
  )

  useEffect(() => {
    if (remainingStudyMinutes === 0 && !needsPreviewCompletion) {
      pushSessionEvent('完成阈值已满足', '学习时长与资料阅读条件都已满足，可以标记本课时完成。', 'complete')
    }
  }, [needsPreviewCompletion, pushSessionEvent, remainingStudyMinutes])

  useEffect(() => {
    if (!isVideoPlaying || !currentLesson) {
      lastTickRef.current = null
      return
    }

    const timer = window.setInterval(() => {
      const now = Date.now()
      if (lastTickRef.current === null) {
        lastTickRef.current = now
        return
      }
      const deltaSeconds = Math.max(1, Math.floor((now - lastTickRef.current) / 1000))
      lastTickRef.current = now
      setPendingStudySeconds((current) => current + deltaSeconds)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [currentLesson, isVideoPlaying])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        void flushPendingProgress('before-unload')
      }
    }
    const handleBeforeUnload = () => {
      void flushPendingProgress('before-unload')
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [flushPendingProgress])

  useEffect(() => {
    return () => {
      void flushPendingProgress('switch')
    }
  }, [flushPendingProgress])

  async function submitStudyUpdate(
    actionKey: string,
    statusCompleted: boolean,
    studyMinutes: number,
    nextPositionSeconds: number,
    options?: {
      silent?: boolean
      completedPreviewResourceIds?: string[]
      playbackRate?: number
      eventType?: string
    },
  ) {
    if (!currentLesson || !canStudy || submittingAction !== null) return

    setSubmittingAction(actionKey)
    try {
      await onRecordLessonStudy(currentLesson.id, statusCompleted, studyMinutes, nextPositionSeconds, options)
      if (studyMinutes > 0) setPendingStudySeconds(0)
      if (options?.completedPreviewResourceIds) setCompletedPreviewIds(options.completedPreviewResourceIds)
      pushSessionEvent(
        actionKey === 'complete' ? '课时完成条件已满足' : '学习记录已更新',
        studyMinutes > 0 ? `补记 ${studyMinutes} 分钟，位置 ${formatSeconds(nextPositionSeconds)}` : `位置 ${formatSeconds(nextPositionSeconds)}`,
        actionKey === 'complete' ? 'complete' : 'progress',
      )
    } finally {
      setSubmittingAction(null)
    }
  }

  return {
    behaviorSummary,
    canCompleteLesson,
    combinedTimeline,
    completedPreviewIds,
    currentLesson,
    flushPendingProgress,
    hasVideo,
    markPreviewAsRead,
    needsPreviewCompletion,
    pendingStudySeconds,
    playbackRate,
    positionDraft,
    previewError,
    previewProgress,
    previewTargets,
    pushSessionEvent,
    remainingStudyMinutes,
    requiredStudyMinutes,
    restoredLessonIdRef,
    selectedPreviewLabel,
    selectedPreviewUrl,
    setIsVideoPlaying,
    setPlaybackRate,
    setPositionDraft,
    setPreviewError,
    setSelectedPreviewLabel,
    setSelectedPreviewUrl,
    submittingAction,
    submitStudyUpdate,
    totalTrackedStudyMinutes,
    videoRef,
  }
}
