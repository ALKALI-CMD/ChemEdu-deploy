import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import { Button, Textarea } from '@/components/ui/UiComponents'
import AttachmentList from './AttachmentList'

type AssignmentSubmissionEditorProps = {
  assignment: Assignment
  currentDraft: string
  draftAttachments: AssignmentAttachment[]
  onDraftChange: (assignmentId: string, value: string) => void
  onAttachmentSelect: (assignmentId: string, files: FileList | null) => Promise<void>
  onAttachmentClear: (assignmentId: string) => void
}

export default function AssignmentSubmissionEditor({
  assignment,
  currentDraft,
  draftAttachments,
  onDraftChange,
  onAttachmentSelect,
  onAttachmentClear,
}: AssignmentSubmissionEditorProps) {
  return (
    <>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-slate-900">教师提供的参考附件</p>
        <AttachmentList
          attachments={assignment.referenceAttachments ?? []}
          emptyLabel={assignment.attachmentLabel ? `参考文件：${assignment.attachmentLabel}` : '暂无参考附件'}
        />
      </div>

      <Textarea
        className="mt-4 min-h-24 bg-white"
        placeholder="写下你的答案、实现思路、遇到的问题，或需要老师特别查看的说明。"
        value={currentDraft}
        onChange={(event) => onDraftChange(assignment.id, event.target.value)}
      />

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">本次提交附件</p>
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
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">待提交附件</p>
            <AttachmentList attachments={draftAttachments} emptyLabel="当前没有新增附件" />
          </div>
          {draftAttachments.length > 0 ? (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onAttachmentClear(assignment.id)}>
              清空待提交附件
            </Button>
          ) : null}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">已提交附件</p>
            <AttachmentList attachments={assignment.submissionAttachments ?? []} emptyLabel="尚未提交附件" />
          </div>
        </div>
      </div>
    </>
  )
}
