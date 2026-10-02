import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'
import ManageCourseSummary from './ManageCourseSummary'
import ManageInsightCards from './ManageInsightCards'
import ManageInsightDrilldown from './ManageInsightDrilldown'
import { buildCourseManageInsightModel, type ManageDrilldownKey } from '../functions/manageStatusModel'

type ManageStatusCardProps = {
  course: Course
  teacherName: string
  assistantNames: string
  teachingInsights: TeachingInsightSnapshot
}

export default function ManageStatusCard({ course, teacherName, assistantNames, teachingInsights }: ManageStatusCardProps) {
  const [activeDrilldown, setActiveDrilldown] = useState<ManageDrilldownKey>('risk')
  const { atRiskStudents, bottlenecks, distribution } = useMemo(
    () => buildCourseManageInsightModel(course, teachingInsights),
    [course, teachingInsights],
  )

  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <ManageCourseSummary course={course} teacherName={teacherName} assistantNames={assistantNames} />
        <ManageInsightCards
          atRiskStudents={atRiskStudents}
          bottlenecks={bottlenecks}
          averageCompletionRate={distribution?.averageCompletionRate ?? 0}
          onSelect={setActiveDrilldown}
        />
        <ManageInsightDrilldown
          courseId={course.id}
          activeDrilldown={activeDrilldown}
          atRiskStudents={atRiskStudents}
          bottlenecks={bottlenecks}
          distribution={distribution}
          onSelect={setActiveDrilldown}
        />
      </CardContent>
    </Card>
  )
}
