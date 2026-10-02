import { Button } from '@/components/ui/UiComponents'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import AdminActionGroup from '../../../AdminActionGroup'
import AdminStatusBadge from '../../../AdminStatusBadge'
import type { OperationLogItem } from '../../../../objects/adminConsoleConfig'
import GovernanceDecisionHistory from './GovernanceDecisionHistory'

type GovernanceDiscussionCardProps = {
  discussion: DiscussionTopic
  busyKey: string | null
  governanceLogs: OperationLogItem[]
  onModerateTopic: (
    topicId: DiscussionTopic['id'],
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) => Promise<void>
}

export default function GovernanceDiscussionCard({
  discussion,
  busyKey,
  governanceLogs,
  onModerateTopic,
}: GovernanceDiscussionCardProps) {
  const relatedLogs = governanceLogs.filter((item) => item.target.includes(discussion.title))

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{discussion.title}</p>
          <p className="text-sm text-slate-500">
            {discussion.author} / 最近更新：{discussion.lastReplyAt} / 回复 {discussion.replyCount} 条
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge label={discussion.visibility === DiscussionVisibility.Hidden ? '已隐藏' : '显示中'} tone="neutral" />
          {discussion.threadState === DiscussionThreadState.Locked ? <AdminStatusBadge label="已锁帖" tone="info" /> : null}
          {discussion.pinState === DiscussionPinState.Pinned ? <AdminStatusBadge label="已置顶" tone="success" /> : null}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{discussion.content}</p>

      <div className="mt-4">
        <GovernanceDecisionHistory discussion={discussion} relatedLogs={relatedLogs} />
      </div>

      <div className="mt-4">
        <AdminActionGroup>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={busyKey === `discussion:${discussion.id}`}
            onClick={() =>
              void onModerateTopic(
                discussion.id,
                discussion.visibility,
                discussion.threadState,
                discussion.pinState === DiscussionPinState.Pinned ? DiscussionPinState.Normal : DiscussionPinState.Pinned,
              )
            }
          >
            {discussion.pinState === DiscussionPinState.Pinned ? '取消置顶' : '置顶'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={busyKey === `discussion:${discussion.id}`}
            onClick={() =>
              void onModerateTopic(
                discussion.id,
                discussion.visibility,
                discussion.threadState === DiscussionThreadState.Locked ? DiscussionThreadState.Open : DiscussionThreadState.Locked,
                discussion.pinState,
              )
            }
          >
            {discussion.threadState === DiscussionThreadState.Locked ? '解锁' : '锁帖'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={busyKey === `discussion:${discussion.id}`}
            onClick={() =>
              void onModerateTopic(
                discussion.id,
                discussion.visibility === DiscussionVisibility.Hidden ? DiscussionVisibility.Visible : DiscussionVisibility.Hidden,
                discussion.threadState,
                discussion.pinState,
              )
            }
          >
            {discussion.visibility === DiscussionVisibility.Hidden ? '恢复显示' : '隐藏'}
          </Button>
        </AdminActionGroup>
      </div>
    </div>
  )
}
