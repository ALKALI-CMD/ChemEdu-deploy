import { Button, Input, Textarea } from '@/components/ui/UiComponents'

type DiscussionComposerProps = {
  lessonOptions: Array<{ id: string; title: string }>
  selectedLessonId: string
  topicTitle: string
  topicContent: string
  submitting: boolean
  onLessonChange: (value: string) => void
  onTopicTitleChange: (value: string) => void
  onTopicContentChange: (value: string) => void
  onCreateTopic: () => Promise<void>
}

export default function DiscussionComposer({
  lessonOptions,
  selectedLessonId,
  topicTitle,
  topicContent,
  submitting,
  onLessonChange,
  onTopicTitleChange,
  onTopicContentChange,
  onCreateTopic,
}: DiscussionComposerProps) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-medium text-slate-950">发起讨论</p>
        <p className="mt-1 text-xs text-slate-500">可以提问、记录学习卡点，也可以请老师确认你的理解。</p>
      </div>
      <select
        className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        value={selectedLessonId}
        onChange={(event) => onLessonChange(event.target.value)}
      >
        <option value="general">关联到课程整体</option>
        {lessonOptions.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>
      <Input placeholder="一句话概括你想讨论的问题" value={topicTitle} onChange={(event) => onTopicTitleChange(event.target.value)} />
      <Textarea
        className="min-h-28 bg-white"
        placeholder="把背景、你已经尝试过的办法、希望大家帮你看的点写清楚。"
        value={topicContent}
        onChange={(event) => onTopicContentChange(event.target.value)}
      />
      <div className="flex justify-end">
        <Button className="rounded-lg bg-slate-950 text-white hover:bg-slate-800" onClick={() => void onCreateTopic()} disabled={submitting}>
          发布到讨论区
        </Button>
      </div>
    </div>
  )
}
