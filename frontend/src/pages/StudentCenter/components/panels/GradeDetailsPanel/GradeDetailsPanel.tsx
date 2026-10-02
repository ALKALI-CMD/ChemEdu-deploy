import { LearningPerformanceHeatmap } from '@/components/education/VisualStates'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { GradeDetailItem, GradeTrendPoint } from '../../../hooks/useStudentCenterModel'
import CourseGradeTranscriptCard from './components/CourseGradeTranscriptCard'
import GradeRecordListCard from './components/GradeRecordListCard'

export default function GradeDetailsPanel({
  gradebook,
  courseProgress,
  gradeDetails,
  gradeTrend,
}: {
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
  gradeDetails: GradeDetailItem[]
  gradeTrend: GradeTrendPoint[]
}) {
  return (
    <div className="grid gap-6">
      <CourseGradeTranscriptCard gradebook={gradebook} courseProgress={courseProgress} gradeDetails={gradeDetails} />
      <LearningPerformanceHeatmap gradeTrend={gradeTrend} courseProgress={courseProgress} />
      <GradeRecordListCard gradeDetails={gradeDetails} />
    </div>
  )
}
