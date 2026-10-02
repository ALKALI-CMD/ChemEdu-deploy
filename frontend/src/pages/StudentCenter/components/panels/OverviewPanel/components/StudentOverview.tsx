import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import StudentOverviewMetrics from './StudentOverviewMetrics'

type StudentOverviewProps = {
  enrolledCourses: Course[]
  assignments: Assignment[]
  quizzes: Quiz[]
}

export default function StudentOverview(props: StudentOverviewProps) {
  return <StudentOverviewMetrics {...props} />
}
