import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { Button } from '@/components/ui/UiComponents'
import ReviewAttachmentList from './ReviewAttachmentList'

type AssignmentReviewAttachmentEditorProps = {
  assignment: Assignment
  reviewDraftAttachments: AssignmentAttachment[]
  onAttachmentSelect: (assignmentId: string, files: FileList | null) => Promise<void>
  onAttachmentClear: (assignmentId: string) => void
}

export default function AssignmentReviewAttachmentEditor({
  assignment,
  reviewDraftAttachments,
  onAttachmentSelect,
  onAttachmentClear,
}: AssignmentReviewAttachmentEditorProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">本次反馈附件</p>
        </div>
        <label className="cursor-pointer rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          选择文件
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => void onAttachmentSelect(assignment.id, event.target.files)}
          />
        </label>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">待提交反馈附件</p>
          <ReviewAttachmentList attachments={reviewDraftAttachments} emptyLabel="当前没有新增反馈附件" />
        </div>
        {reviewDraftAttachments.length > 0 ? (
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onAttachmentClear(assignment.id)}>
            清空待提交附件
          </Button>
        ) : null}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">历史反馈附件</p>
          <ReviewAttachmentList attachments={assignment.reviewAttachments ?? []} emptyLabel="历史上暂无反馈附件" />
        </div>
      </div>
    </div>
  )
}
