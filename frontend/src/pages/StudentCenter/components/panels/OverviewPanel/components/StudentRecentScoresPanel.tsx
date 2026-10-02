import { Badge, Card, CardContent } from '@/components/ui/UiComponents'
import type { LatestScoreItem } from '../../../../hooks/useStudentCenterModel'

type StudentRecentScoresPanelProps = {
  latestScores: LatestScoreItem[]
}

function categoryLabel(category: LatestScoreItem['category']) {
  switch (category) {
    case 'course':
      return '课程总评'
    case 'assignment':
      return '作业成绩'
    case 'quiz':
      return '测验成绩'
  }
}

export default function StudentRecentScoresPanel({ latestScores }: StudentRecentScoresPanelProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">最近成绩</p>
        </div>

        {latestScores.length > 0 ? (
          <div className="space-y-3">
            {latestScores.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">{categoryLabel(item.category)}</Badge>
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100">{item.score}</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">{item.timestamp ? `记录时间：${item.timestamp}` : '已同步到当前最新成绩'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            暂无最近成绩，完成作业或测验后会在这里汇总展示。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
