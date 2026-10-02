import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'
import CourseGradeDetailCard from './CourseGradeDetailCard'
import CourseGradeEntryList from './CourseGradeEntryList'

type CompletionDistribution = {
  courseId: string
  excellentCount: number
  steadyCount: number
  warningCount: number
  stuckCount: number
}

type CourseGradeDetailPanelProps = {
  detailCourseId?: string
  selectedGradeEntry: GradebookEntry | null
  gradebookEntries: GradebookEntry[]
  courseProgressEntries: CourseProgressStats[]
  assignments: Assignment[]
  quizzes: Quiz[]
  completionDistributions: CompletionDistribution[]
  courseTitleMap: Map<string, string>
}

export default function CourseGradeDetailPanel({
  detailCourseId,
  selectedGradeEntry,
  gradebookEntries,
  courseProgressEntries,
  assignments,
  quizzes,
  completionDistributions,
  courseTitleMap,
}: CourseGradeDetailPanelProps) {
  if (!selectedGradeEntry) return null

  return (
    <section className={detailCourseId ? 'grid gap-4 xl:grid-cols-[0.9fr_1.1fr]' : 'grid gap-4'}>
      {!detailCourseId ? (
        <CourseGradeEntryList
          selectedGradeEntry={selectedGradeEntry}
          gradebookEntries={gradebookEntries}
          courseProgressEntries={courseProgressEntries}
          courseTitleMap={courseTitleMap}
        />
      ) : null}

      {detailCourseId ? (
        <CourseGradeDetailCard
          entry={selectedGradeEntry}
          progress={courseProgressEntries.find((item) => item.courseId === selectedGradeEntry.courseId)}
          assignments={assignments.filter((item) => item.courseId === selectedGradeEntry.courseId)}
          quizzes={quizzes.filter((item) => item.courseId === selectedGradeEntry.courseId)}
          distribution={completionDistributions.find((item) => item.courseId === selectedGradeEntry.courseId)}
          courseTitle={courseTitleMap.get(selectedGradeEntry.courseId) ?? selectedGradeEntry.courseTitle}
        />
      ) : null}
    </section>
  )
}
