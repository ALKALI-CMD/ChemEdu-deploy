import { useEffect, useMemo, useState } from 'react'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'

export function useTeacherGradebookState(gradebookEntries: GradebookEntry[], quizzes: Quiz[], detailCourseId?: string, detailQuizId?: string) {
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({})
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [submittingQuizId, setSubmittingQuizId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedGradeCourseId, setSelectedGradeCourseId] = useState<string | null>(null)
  const [selectedSubjectiveQuizId, setSelectedSubjectiveQuizId] = useState<string | null>(null)

  const pendingSubjectiveQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.subjectiveQuestionCount > 0 && quiz.status === QuizStatus.Finished && !quiz.reviewedAt),
    [quizzes],
  )

  useEffect(() => {
    if (gradebookEntries.length === 0) {
      setSelectedGradeCourseId(null)
      return
    }
    if (!selectedGradeCourseId || !gradebookEntries.some((entry) => entry.courseId === selectedGradeCourseId)) {
      setSelectedGradeCourseId(gradebookEntries[0].courseId)
    }
  }, [gradebookEntries, selectedGradeCourseId])

  useEffect(() => {
    if (pendingSubjectiveQuizzes.length === 0) {
      setSelectedSubjectiveQuizId(null)
      return
    }
    if (!selectedSubjectiveQuizId || !pendingSubjectiveQuizzes.some((quiz) => quiz.id === selectedSubjectiveQuizId)) {
      setSelectedSubjectiveQuizId(pendingSubjectiveQuizzes[0].id)
    }
  }, [pendingSubjectiveQuizzes, selectedSubjectiveQuizId])

  const selectedGradeEntry = detailCourseId
    ? gradebookEntries.find((entry) => entry.courseId === detailCourseId) ?? null
    : gradebookEntries.find((entry) => entry.courseId === selectedGradeCourseId) ?? gradebookEntries[0] ?? null
  const selectedSubjectiveQuiz = detailQuizId
    ? pendingSubjectiveQuizzes.find((quiz) => quiz.id === detailQuizId) ?? null
    : pendingSubjectiveQuizzes.find((quiz) => quiz.id === selectedSubjectiveQuizId) ?? pendingSubjectiveQuizzes[0] ?? null

  return {
    feedbackDrafts,
    pendingSubjectiveQuizzes,
    scoreDrafts,
    selectedCourseId,
    selectedGradeEntry,
    selectedGradeCourseId,
    selectedSubjectiveQuiz,
    selectedSubjectiveQuizId,
    setFeedbackDrafts,
    setScoreDrafts,
    setSelectedCourseId,
    setSubmittingQuizId,
    submittingQuizId,
  }
}
