import type { Assignment } from '@/objects/course/learning/Assignment'
import { Card, CardContent } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

export default function AssignmentDetailHighlight({ assignment }: { assignment?: Assignment }) {
  if (!assignment) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50 text-slate-900 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-amber-700">当前定位作业</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">{zh(assignment.title)}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{zh(assignment.description)}</p>
        <p className="mt-2 text-xs text-slate-500">截止时间：{assignment.deadline}</p>
      </CardContent>
    </Card>
  )
}
