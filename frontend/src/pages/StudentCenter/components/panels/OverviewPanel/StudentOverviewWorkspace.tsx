import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { ContinueLearningItem, LatestScoreItem, TimelineItem } from '../../../hooks/useStudentCenterModel'
import StudentCourseFinderCard from './components/StudentCourseFinderCard'
import StudentQuickAccessCard from './components/StudentQuickAccessCard'
import StudentOverview from './components/StudentOverview'
import StudentProgressPanel from './components/StudentProgressPanel'
import StudentRecentScoresPanel from './components/StudentRecentScoresPanel'
import StudentScoreTrendChart from './components/StudentScoreTrendChart'
import StudentTimelinePanel from './components/StudentTimelinePanel'

type StudentOverviewWorkspaceProps = {
  enrolledCourses: Course[]
  recommendedCourses: Course[]
  assignments: Assignment[]
  quizzes: Quiz[]
  continueLearning: ContinueLearningItem | null
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
  latestScores: LatestScoreItem[]
  prioritizedAssignments: Assignment[]
  prioritizedQuizzes: Quiz[]
  groupedTimeline: Record<string, TimelineItem[]>
  courseTitleMap: Map<string, string>
  teacherNameById: Map<string, string>
}

export default function StudentOverviewWorkspace(props: StudentOverviewWorkspaceProps) {
  const {
    enrolledCourses,
    recommendedCourses,
    assignments,
    quizzes,
    continueLearning,
    gradebook,
    courseProgress,
    latestScores,
    prioritizedAssignments,
    prioritizedQuizzes,
    groupedTimeline,
    courseTitleMap,
    teacherNameById,
  } = props

  return (
    <>
      <StudentQuickAccessCard enrolledCourses={enrolledCourses} assignments={assignments} quizzes={quizzes} />
      <StudentCourseFinderCard recommendedCourses={recommendedCourses} teacherNameById={teacherNameById} />

      <StudentOverview enrolledCourses={enrolledCourses} assignments={assignments} quizzes={quizzes} />
      <StudentScoreTrendChart assignments={assignments} quizzes={quizzes} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <StudentProgressPanel
          continueLearning={continueLearning}
          enrolledCourses={enrolledCourses}
          gradebook={gradebook}
          courseProgress={courseProgress}
        />
        <StudentRecentScoresPanel latestScores={latestScores} />
      </section>

      <StudentTimelinePanel
        prioritizedAssignments={prioritizedAssignments}
        prioritizedQuizzes={prioritizedQuizzes}
        groupedTimeline={groupedTimeline}
        courseTitleMap={courseTitleMap}
      />
    </>
  )
}
