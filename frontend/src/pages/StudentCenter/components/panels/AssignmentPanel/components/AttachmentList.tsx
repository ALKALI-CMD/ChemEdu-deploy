import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

type AttachmentListProps = {
  attachments?: AssignmentAttachment[]
  emptyLabel: string
}

export default function AttachmentList({ attachments, emptyLabel }: AttachmentListProps) {
  const safeAttachments = attachments ?? []

  if (safeAttachments.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {safeAttachments.map((attachment, index) => (
        <a
          key={`${attachment.label}-${index}`}
          href={attachment.url || '#'}
          download={attachment.label}
          target={attachment.url ? '_blank' : undefined}
          rel={attachment.url ? 'noreferrer' : undefined}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
        >
          {attachment.label}
        </a>
      ))}
    </div>
  )
}
