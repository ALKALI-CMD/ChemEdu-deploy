import { Badge } from '@/components/ui/UiComponents'
import type { Lesson } from '@/objects/course/catalog/Lesson'
import { contentTypeLabel, text } from '../functions/lessonStudyUtils'

type LessonContentBlocksPanelProps = {
  lesson: Lesson
}

export default function LessonContentBlocksPanel({ lesson }: LessonContentBlocksPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">课时正文与内容块</p>
        <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">
          完成阈值：学习满 {lesson.requiredStudyMinutes} 分钟
        </Badge>
      </div>
      <div className="mt-3 space-y-3">
        {lesson.contentBlocks.length > 0 ? (
          lesson.contentBlocks.map((block) => (
            <div key={block.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                  {contentTypeLabel(block.contentType)}
                </Badge>
                <p className="font-medium text-slate-950">{text(block.title)}</p>
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{text(block.content)}</div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">当前课时还没有配置正文内容块。</div>
        )}
      </div>
    </div>
  )
}
