import { Button, Textarea } from '@/components/ui/UiComponents'

type DiscussionReplyComposerProps = {
  replyDraft: string
  submitting: boolean
  topicId: string
  onReplyDraftChange: (value: string) => void
  onReply: (topicId: string) => Promise<void>
}

export default function DiscussionReplyComposer({
  replyDraft,
  submitting,
  topicId,
  onReplyDraftChange,
  onReply,
}: DiscussionReplyComposerProps) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <Textarea
        className="min-h-24 bg-white"
        placeholder="直接写你的看法、解法，或继续追问还没理解的地方。"
        value={replyDraft}
        onChange={(event) => onReplyDraftChange(event.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
          disabled={submitting}
          onClick={() => void onReply(topicId)}
        >
          {submitting ? '发送中…' : '回复讨论'}
        </Button>
      </div>
    </div>
  )
}
