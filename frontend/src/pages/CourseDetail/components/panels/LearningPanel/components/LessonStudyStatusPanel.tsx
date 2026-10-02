import { Badge, Button, Input } from '@/components/ui/UiComponents'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { formatSeconds } from '../functions/lessonStudyUtils'

type LessonStudyBehaviorSummary = {
  pauseCount: number
  playCount: number
  previewCount: number
  saveCount: number
}

type LessonStudyStatusPanelProps = {
  lesson: Lesson
  canStudy: boolean
  canCompleteLesson: boolean
  hasVideo: boolean
  needsPreviewCompletion: boolean
  requiredStudyMinutes: number
  remainingStudyMinutes: number
  totalTrackedStudyMinutes: number
  previewProgress: {
    total: number
    completed: number
  }
  behaviorSummary: LessonStudyBehaviorSummary
  pendingStudySeconds: number
  playbackRate: number
  positionDraft: number
  submittingAction: string | null
  onPositionDraftChange: (value: number) => void
  onSaveProgress: () => void
  onCompleteLesson: () => void
}

export default function LessonStudyStatusPanel({
  lesson,
  canStudy,
  canCompleteLesson,
  hasVideo,
  needsPreviewCompletion,
  requiredStudyMinutes,
  remainingStudyMinutes,
  totalTrackedStudyMinutes,
  previewProgress,
  behaviorSummary,
  pendingStudySeconds,
  playbackRate,
  positionDraft,
  submittingAction,
  onPositionDraftChange,
  onSaveProgress,
  onCompleteLesson,
}: LessonStudyStatusPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">学习状态</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {canCompleteLesson ? '已满足完成条件' : lesson.completed ? '课时已完成' : '继续学习中'}
          </p>
        </div>
        <Badge className={canCompleteLesson || lesson.completed ? 'rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-50' : 'rounded-full bg-sky-50 text-sky-800 hover:bg-sky-50'}>
          {lesson.completed ? '已完成' : canCompleteLesson ? '可完成' : '学习中'}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">完成条件</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>学习时长：{totalTrackedStudyMinutes} / {requiredStudyMinutes} 分钟</p>
            <p>剩余时长：{hasVideo ? `${remainingStudyMinutes} 分钟` : '无视频课时可直接完成'}</p>
            <p>资料阅读：{previewProgress.total > 0 ? `${previewProgress.completed} / ${previewProgress.total}` : '无额外要求'}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">本次学习</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>播放 / 暂停：{behaviorSummary.playCount} / {behaviorSummary.pauseCount}</p>
            <p>资料阅读事件：{behaviorSummary.previewCount}</p>
            <p>待补记学习：{formatSeconds(pendingStudySeconds)}</p>
            <p>当前倍速：{playbackRate}x</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900">手动调整学习位置（秒）</span>
          <Input
            type="number"
            min={0}
            value={positionDraft}
            onChange={(event) => onPositionDraftChange(Math.max(0, Number(event.target.value) || 0))}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={onSaveProgress}
            disabled={!canStudy || submittingAction !== null}
          >
            保存进度
          </Button>
          <Button
            type="button"
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={onCompleteLesson}
            disabled={!canCompleteLesson || submittingAction !== null}
          >
            标记本课时已完成
          </Button>
        </div>
        {!canStudy ? (
          <p className="text-sm text-amber-700">当前课时尚未解锁，请先完成前置学习条件。</p>
        ) : null}
        {hasVideo && remainingStudyMinutes > 0 ? (
          <p className="text-sm text-slate-600">还需要再学习 {remainingStudyMinutes} 分钟，才能满足完成条件。</p>
        ) : null}
        {hasVideo && needsPreviewCompletion ? (
          <p className="text-sm text-slate-600">还有 {previewProgress.total - previewProgress.completed} 份可预览资料未完成阅读。</p>
        ) : null}
      </div>
    </div>
  )
}
