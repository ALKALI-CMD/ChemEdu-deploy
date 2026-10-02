import { BarChart3 } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import { findBusinessCourse } from '../functions/businessPanelModel'

type BusinessRecommendationCardProps = {
  dashboard: EducationDashboardResponse
}

export default function BusinessRecommendationCard({ dashboard }: BusinessRecommendationCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          推荐系统
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {dashboard.recommendations.map((item) => {
            const course = findBusinessCourse(dashboard.courses, item.courseId)
            return (
              <div key={`${item.courseId}-${item.recommendationType}`} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-950">{course ? zh(course.title) : item.courseId}</p>
                <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                <Badge className="mt-2 border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-50">{item.recommendationType} · {item.score}</Badge>
              </div>
            )
          })}
        </div>
        <div className="space-y-3">
          {dashboard.learningPaths.map((path) => (
            <div key={path.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-950">{path.title}</p>
              <p className="mt-1 text-sm text-slate-500">{path.reason} · 约 {path.estimatedHours} 学时</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
