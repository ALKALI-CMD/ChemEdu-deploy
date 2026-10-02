import { Button, Input, Textarea } from '@/components/ui/UiComponents'

type DiscussionTopicEditorProps = {
  title: string
  content: string
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
  onCancel: () => void
  onSave: () => Promise<void>
}

export default function DiscussionTopicEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onCancel,
  onSave,
}: DiscussionTopicEditorProps) {
  return (
    <div className="mt-4 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <Input value={title} onChange={(event) => onTitleChange(event.target.value)} />
      <Textarea
        className="min-h-24 bg-white"
        placeholder="更新问题背景、补充说明或整理已解决的思路。"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>
          取消
        </Button>
        <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={() => void onSave()}>
          保存主题
        </Button>
      </div>
    </div>
  )
}
