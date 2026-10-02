import { Badge, Card, CardContent } from '@/components/ui/UiComponents'

export default function ManageEditorEntryCard() {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">课程编辑表单</p>
          <p className="text-sm leading-6 text-slate-600">编辑课程基本信息、标签和章节内容。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-slate-100 text-slate-900 hover:bg-slate-100">课程标题与简介</Badge>
          <Badge className="rounded-full bg-slate-100 text-slate-900 hover:bg-slate-100">标签与时间安排</Badge>
          <Badge className="rounded-full bg-slate-100 text-slate-900 hover:bg-slate-100">章节与课时结构</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
