import { useMemo } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import CourseGradeDetailPanel from './components/CourseGradeDetailPanel'
import GradeDistributionDrilldownPanel from './components/GradeDistributionDrilldownPanel'
import GradebookOverviewPanel from './components/GradebookOverviewPanel'
import SubjectiveQuizReviewPanel from './components/SubjectiveQuizReviewPanel'
import TeachingInsightCardsPanel from './components/TeachingInsightCardsPanel'
import { useTeacherGradebookState } from './hooks/useTeacherGradebookState'
import { calculateGradebookOverview } from './functions/gradebookUtils'
import { exportTeacherGradebook } from './functions/teacherGradebookExport'

export default function TeacherGradebookPanel({
  courses,
  gradebookEntries,
  courseProgressEntries,
  assignments,
  quizzes,
  dashboard,
  detailCourseId,
  detailQuizId,
  onReviewQuiz,
}: {
  courses: Course[]
  gradebookEntries: GradebookEntry[]
  courseProgressEntries: CourseProgressStats[]
  assignments: Assignment[]
  quizzes: Quiz[]
  dashboard: EducationDashboardResponse
  detailCourseId?: string
  detailQuizId?: string
  onReviewQuiz: (quizId: string, subjectiveScore: number, feedback?: string) => Promise<void>
}) {
  const gradebookState = useTeacherGradebookState(gradebookEntries, quizzes, detailCourseId, detailQuizId)
  const courseTitleMap = useMemo(() => new Map(courses.map((course) => [course.id, String(course.title)])), [courses])
  const insights = dashboard.teachingInsights
  const courseGradeDistributions = insights.courseGradeDistributions
  const classGradeDistributions = insights.classGradeDistributions
  const { overallCourseAverage, overallPassRate, overallExcellentRate } = calculateGradebookOverview(courseGradeDistributions)

  const visibleCourseDistributions = useMemo(
    () =>
      gradebookState.selectedCourseId === 'all'
        ? courseGradeDistributions
        : courseGradeDistributions.filter((item) => item.courseId === gradebookState.selectedCourseId),
    [courseGradeDistributions, gradebookState.selectedCourseId],
  )

  const visibleClassDistributions = useMemo(
    () =>
      gradebookState.selectedCourseId === 'all'
        ? classGradeDistributions
        : classGradeDistributions.filter((item) => item.courseId === gradebookState.selectedCourseId),
    [classGradeDistributions, gradebookState.selectedCourseId],
  )

  async function handleSubmitReview(quiz: Quiz) {
    const score = Number(gradebookState.scoreDrafts[quiz.id] ?? '')
    if (!Number.isFinite(score) || score < 0 || score > 100) return

    gradebookState.setSubmittingQuizId(String(quiz.id))
    try {
      const feedback = (gradebookState.feedbackDrafts[quiz.id] ?? '').trim()
      await onReviewQuiz(quiz.id, score, feedback || undefined)
      gradebookState.setScoreDrafts((current) => ({ ...current, [quiz.id]: '' }))
      gradebookState.setFeedbackDrafts((current) => ({ ...current, [quiz.id]: '' }))
    } finally {
      gradebookState.setSubmittingQuizId(null)
    }
  }

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <CardTitle className="text-slate-950">成绩册与成绩分析</CardTitle>
        </div>
        <Button
          type="button"
          className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
          onClick={() =>
            exportTeacherGradebook({
              gradebookEntries,
              courseProgressEntries,
              courseTitleMap,
              courseGradeDistributions,
              classGradeDistributions,
            })
          }
        >
          导出成绩册
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <GradebookOverviewPanel
          overallCourseAverage={overallCourseAverage}
          overallPassRate={overallPassRate}
          overallExcellentRate={overallExcellentRate}
          insights={insights}
        />

        <GradeDistributionDrilldownPanel
          courseGradeDistributions={courseGradeDistributions}
          visibleCourseDistributions={visibleCourseDistributions}
          visibleClassDistributions={visibleClassDistributions}
          selectedCourseId={gradebookState.selectedCourseId}
          onSelectedCourseIdChange={gradebookState.setSelectedCourseId}
        />

        <TeachingInsightCardsPanel
          insights={insights}
          pendingSubjectiveQuizzes={gradebookState.pendingSubjectiveQuizzes}
          courseTitleMap={courseTitleMap}
        />

        <SubjectiveQuizReviewPanel
          detailQuizId={detailQuizId}
          pendingSubjectiveQuizzes={gradebookState.pendingSubjectiveQuizzes}
          selectedSubjectiveQuiz={gradebookState.selectedSubjectiveQuiz}
          selectedSubjectiveQuizId={gradebookState.selectedSubjectiveQuizId}
          scoreDrafts={gradebookState.scoreDrafts}
          feedbackDrafts={gradebookState.feedbackDrafts}
          submittingQuizId={gradebookState.submittingQuizId}
          courseTitleMap={courseTitleMap}
          onScoreDraftChange={(quizId, value) => gradebookState.setScoreDrafts((current) => ({ ...current, [quizId]: value }))}
          onFeedbackDraftChange={(quizId, value) => gradebookState.setFeedbackDrafts((current) => ({ ...current, [quizId]: value }))}
          onSubmitReview={(quiz) => void handleSubmitReview(quiz)}
        />

        <CourseGradeDetailPanel
          detailCourseId={detailCourseId}
          selectedGradeEntry={gradebookState.selectedGradeEntry}
          gradebookEntries={gradebookEntries}
          courseProgressEntries={courseProgressEntries}
          assignments={assignments}
          quizzes={quizzes}
          completionDistributions={insights.completionDistributions}
          courseTitleMap={courseTitleMap}
        />
      </CardContent>
    </Card>
  )
}
