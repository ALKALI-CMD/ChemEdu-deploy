import type { Lesson } from '@/objects/course/catalog/Lesson'
import { Card, CardContent } from '@/components/ui/UiComponents'
import { useLessonStudySession } from '../hooks/useLessonStudySession'
import { formatSeconds } from '../functions/lessonStudyUtils'
import LessonContentBlocksPanel from './LessonContentBlocksPanel'
import LessonResourceAttachmentPanel from './LessonResourceAttachmentPanel'
import LessonResourcePreviewPanel from './LessonResourcePreviewPanel'
import LessonStudyHeader from './LessonStudyHeader'
import LessonStudyStatusPanel from './LessonStudyStatusPanel'
import LessonStudyTimelinePanel from './LessonStudyTimelinePanel'
import LessonVideoStudyPanel from './LessonVideoStudyPanel'

type LessonStudyWorkspaceProps = {
  lesson: Lesson | null
  canStudy: boolean
  onRecordLessonStudy: (
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
}

export default function LessonStudyWorkspace({
  lesson,
  canStudy,
  onRecordLessonStudy,
}: LessonStudyWorkspaceProps) {
  const session = useLessonStudySession(lesson, canStudy, onRecordLessonStudy)
  const currentLesson = session.currentLesson

  if (!currentLesson) {
    return (
      <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-slate-500">请选择一个课时。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <LessonStudyHeader
        lesson={currentLesson}
        positionDraft={session.positionDraft}
        requiredStudyMinutes={session.requiredStudyMinutes}
        totalTrackedStudyMinutes={session.totalTrackedStudyMinutes}
      />

      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <LessonVideoStudyPanel
              lesson={currentLesson}
              videoRef={session.videoRef}
              playbackRate={session.playbackRate}
              positionDraft={session.positionDraft}
              restoredLessonIdRef={session.restoredLessonIdRef}
              onPlaybackRateChange={(nextRate) => {
                session.setPlaybackRate(nextRate)
                void onRecordLessonStudy(currentLesson.id, currentLesson.completed, 0, session.positionDraft, {
                  silent: true,
                  completedPreviewResourceIds: session.completedPreviewIds,
                  playbackRate: nextRate,
                  eventType: 'playback_rate_changed',
                })
                session.pushSessionEvent('调整播放倍速', `已切换到 ${nextRate}x 播放速度`, 'video')
              }}
              onRestoredPosition={(restoreSeconds) =>
                session.pushSessionEvent('恢复上次播放位置', `已恢复到 ${formatSeconds(restoreSeconds)}`, 'video')
              }
              onPlay={() => {
                session.setIsVideoPlaying(true)
                session.pushSessionEvent('开始视频学习', `从 ${formatSeconds(session.positionDraft)} 继续播放`, 'video')
                void onRecordLessonStudy(currentLesson.id, currentLesson.completed, 0, session.positionDraft, {
                  silent: true,
                  completedPreviewResourceIds: session.completedPreviewIds,
                  playbackRate: session.playbackRate,
                  eventType: 'video_played',
                })
              }}
              onPause={() => {
                session.setIsVideoPlaying(false)
                session.pushSessionEvent('暂停视频学习', `暂停在 ${formatSeconds(session.positionDraft)}`, 'video')
                void onRecordLessonStudy(currentLesson.id, currentLesson.completed, 0, session.positionDraft, {
                  silent: true,
                  completedPreviewResourceIds: session.completedPreviewIds,
                  playbackRate: session.playbackRate,
                  eventType: 'video_paused',
                })
                void session.flushPendingProgress('pause')
              }}
              onEnded={() => {
                session.setIsVideoPlaying(false)
                session.setPositionDraft(Math.floor(session.videoRef.current?.duration ?? session.positionDraft))
                session.pushSessionEvent('视频播放结束', '已到视频末尾，系统会同步当前位置和学习时长。', 'video')
                void session.flushPendingProgress('pause')
              }}
              onPositionChange={session.setPositionDraft}
            />

            <LessonContentBlocksPanel lesson={currentLesson} />

            <LessonResourcePreviewPanel
              lesson={currentLesson}
              selectedPreviewUrl={session.selectedPreviewUrl}
              selectedPreviewLabel={session.selectedPreviewLabel}
              previewError={session.previewError}
              previewTargets={session.previewTargets}
              previewProgress={session.previewProgress}
              needsPreviewCompletion={session.needsPreviewCompletion}
              onPreviewRead={session.markPreviewAsRead}
              onPreviewError={session.setPreviewError}
            />
          </section>

          <section className="space-y-4">
            <LessonResourceAttachmentPanel
              lesson={currentLesson}
              onSelectPreview={(url, label) => {
                session.setSelectedPreviewUrl(url)
                session.setSelectedPreviewLabel(label)
                session.setPreviewError(null)
              }}
              onOpenPreview={(detail) => session.pushSessionEvent('打开资料预览', detail, 'reading')}
            />

            <LessonStudyStatusPanel
              lesson={currentLesson}
              canStudy={canStudy}
              canCompleteLesson={session.canCompleteLesson}
              hasVideo={session.hasVideo}
              needsPreviewCompletion={session.needsPreviewCompletion}
              requiredStudyMinutes={session.requiredStudyMinutes}
              remainingStudyMinutes={session.remainingStudyMinutes}
              totalTrackedStudyMinutes={session.totalTrackedStudyMinutes}
              previewProgress={session.previewProgress}
              behaviorSummary={session.behaviorSummary}
              pendingStudySeconds={session.pendingStudySeconds}
              playbackRate={session.playbackRate}
              positionDraft={session.positionDraft}
              submittingAction={session.submittingAction}
              onPositionDraftChange={session.setPositionDraft}
              onSaveProgress={() => void session.flushPendingProgress('manual')}
              onCompleteLesson={() =>
                void session.submitStudyUpdate(
                  'complete',
                  true,
                  session.hasVideo ? Math.floor(session.pendingStudySeconds / 60) : session.remainingStudyMinutes,
                  session.positionDraft,
                  {
                    completedPreviewResourceIds: session.completedPreviewIds,
                    playbackRate: session.playbackRate,
                    eventType: 'completed',
                  },
                )
              }
            />

            <LessonStudyTimelinePanel events={session.combinedTimeline} />
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
