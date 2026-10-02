import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { GradeDetailItem } from '../../../../hooks/useStudentCenterModel'
import { categoryLabel, scoreTone } from '../functions/gradeDetailsModel'

type GradeRecordListCardProps = {
  gradeDetails: GradeDetailItem[]
}

export default function GradeRecordListCard({ gradeDetails }: GradeRecordListCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">全部成绩记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gradeDetails.length === 0 ? (
          <EmptyIllustrationState kind="wrongbook" title="暂无成绩记录" message="作业或测验产生评分后，会在这里按时间列出。" />
        ) : null}
        {gradeDetails.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.courseTitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{categoryLabel(item.category)}</Badge>
                <Badge className={`rounded-full ${scoreTone(item.score)} hover:bg-inherit`}>
                  {item.score !== undefined ? `${item.score} 分` : item.status}
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {item.status}
              {item.timestamp ? ` / ${item.timestamp}` : ''}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
