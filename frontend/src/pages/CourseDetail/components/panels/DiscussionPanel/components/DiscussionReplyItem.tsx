import { DiscussionStatusBadges } from '@/components/education/VisualStates'
import ReportButton from '@/components/ReportButton'
import { Badge, Button, Textarea } from '@/components/ui/UiComponents'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import type { PlatformReport } from '@/objects/course/discussion/PlatformReport'
import { zh } from '@/lib/localization'
import { roleBadgeLabel } from './discussionPostUtils'

type DiscussionReplyItemProps = {
  reply: DiscussionTopic['replies'][number]
  canModerate: boolean
  editing: boolean
  editingReplyContent: string
  ownReply: boolean
  onStartReplyEditing: (reply: DiscussionTopic['replies'][number]) => void
  onCancelReplyEditing: () => void
  onEditingReplyContentChange: (value: string) => void
  onSaveReply: () => Promise<void>
  onDeleteReply: (replyId: string) => Promise<void>
  onModerateReply: (replyId: string, visibility: DiscussionVisibility, moderationNote?: string) => Promise<void>
  onReport: (
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) => Promise<PlatformReport>
}

export default function DiscussionReplyItem({
  reply,
  canModerate,
  editing,
  editingReplyContent,
  ownReply,
  onStartReplyEditing,
  onCancelReplyEditing,
  onEditingReplyContentChange,
  onSaveReply,
  onDeleteReply,
  onModerateReply,
  onReport,
}: DiscussionReplyItemProps) {
  async function handleDeleteReply(replyId: string) {
    if (window.confirm('确认删除这条回复吗？')) {
      await onDeleteReply(replyId)
    }
  }

  async function handleToggleReplyVisibility() {
    const moderationNote = window.prompt('可选：填写回复审核说明（可留空）。')?.trim()
    await onModerateReply(
      reply.id,
      reply.visibility === DiscussionVisibility.Hidden ? DiscussionVisibility.Visible : DiscussionVisibility.Hidden,
      moderationNote || undefined,
    )
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{zh(reply.author)}</p>
            {roleBadgeLabel(reply.authorRole) ? (
              <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{roleBadgeLabel(reply.authorRole)}</Badge>
            ) : null}
            <DiscussionStatusBadges
              pinned={false}
              locked={false}
              hidden={reply.visibility === DiscussionVisibility.Hidden}
            />
          </div>
          <p className="text-xs text-slate-500">
            发布于 {zh(reply.createdAt)}
            {reply.updatedAt ? ` · 最近编辑 ${zh(reply.updatedAt)}` : ''}
          </p>
          {canModerate && reply.moderationNote ? (
            <p className="text-xs text-amber-700">审核说明：{zh(reply.moderationNote)}</p>
          ) : null}
        </div>

        <DiscussionReplyActions
          reply={reply}
          canModerate={canModerate}
          ownReply={ownReply}
          onToggleVisibility={handleToggleReplyVisibility}
          onStartReplyEditing={onStartReplyEditing}
          onDeleteReply={handleDeleteReply}
          onReport={onReport}
        />
      </div>

      {editing ? (
        <div className="mt-3 grid gap-3">
          <Textarea
            className="min-h-20 bg-white"
            placeholder="修改这条回复，让表达更准确。"
            value={editingReplyContent}
            onChange={(event) => onEditingReplyContentChange(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onCancelReplyEditing}>
              取消
            </Button>
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={() => void onSaveReply()}>
              保存回复
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 leading-6 text-slate-700">{zh(reply.content)}</p>
      )}
    </div>
  )
}

function DiscussionReplyActions({
  reply,
  canModerate,
  ownReply,
  onToggleVisibility,
  onStartReplyEditing,
  onDeleteReply,
  onReport,
}: {
  reply: DiscussionTopic['replies'][number]
  canModerate: boolean
  ownReply: boolean
  onToggleVisibility: () => Promise<void>
  onStartReplyEditing: (reply: DiscussionTopic['replies'][number]) => void
  onDeleteReply: (replyId: string) => Promise<void>
  onReport: DiscussionReplyItemProps['onReport']
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canModerate ? (
        <Button type="button" variant="outline" className="rounded-full" onClick={() => void onToggleVisibility()}>
          {reply.visibility === DiscussionVisibility.Hidden ? '恢复回复' : '隐藏回复'}
        </Button>
      ) : null}
      {ownReply ? (
        <>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onStartReplyEditing(reply)}>
            编辑回复
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={() => void onDeleteReply(reply.id)}
          >
            删除回复
          </Button>
        </>
      ) : (
        <>
          <ReportButton
            targetType="reply"
            targetId={reply.id}
            targetLabel={`${zh(reply.author)} 的回复`}
            label="举报回复"
            className="rounded-full"
            onSubmit={onReport}
          />
          <ReportButton
            targetType="user"
            targetId={reply.authorId}
            targetLabel={zh(reply.author)}
            label="举报用户"
            className="rounded-full"
            onSubmit={onReport}
          />
        </>
      )}
    </div>
  )
}
