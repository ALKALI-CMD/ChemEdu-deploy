import { useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import TeacherAssignmentStatusChart from './components/TeacherAssignmentStatusChart'
import TeacherInsightCards from './components/TeacherInsightCards'
import TeacherInsightDrilldownPanel from './components/TeacherInsightDrilldownPanel'
import TeacherOverviewMetrics from './components/TeacherOverviewMetrics'
import type { DrilldownKey } from './functions/teacherOverviewModel'

type TeacherOverviewProps = {
  courses: Course[]
  assignments: Assignment[]
  dashboard: EducationDashboardResponse
}

export default function TeacherOverview({ courses, assignments, dashboard }: TeacherOverviewProps) {
  const [activeDrilldown, setActiveDrilldown] = useState<DrilldownKey>('risk')
  const insights = dashboard.teachingInsights

  return (
    <div className="space-y-6">
      <TeacherOverviewMetrics courses={courses} assignments={assignments} dashboard={dashboard} />
      <TeacherAssignmentStatusChart assignments={assignments} />
      <TeacherInsightCards
        insights={insights}
        activeDrilldown={activeDrilldown}
        onDrilldownChange={setActiveDrilldown}
      />
      <TeacherInsightDrilldownPanel
        insights={insights}
        activeDrilldown={activeDrilldown}
        onDrilldownChange={setActiveDrilldown}
      />
    </div>
  )
}
