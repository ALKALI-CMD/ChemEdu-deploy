import { useEffect, useMemo, useRef, useState } from 'react'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { buildCoursePerformance, parseTime, quizSessionStorageKey, readQuizSessions } from '../functions/quizPanelUtils'
import type { QuizFilterKey } from '../components/QuizFilters'

type UseStudentQuizPanelStateParams = {
  quizzes: Quiz[]
  focusQuizId?: string
  focusQuestionId?: string
  submittingKey: string | null
  onSubmit: (quizId: string) => Promise<boolean>
}

export default function useStudentQuizPanelState({
  quizzes,
  focusQuizId,
  focusQuestionId,
  submittingKey,
  onSubmit,
}: UseStudentQuizPanelStateParams) {
  const [filter, setFilter] = useState<QuizFilterKey>('all')
  const [examSessions, setExamSessions] = useState<Record<string, number>>(() => readQuizSessions())
  const [submittedQuizIds, setSubmittedQuizIds] = useState<Set<string>>(() => new Set())
  const [now, setNow] = useState(Date.now())
  const autoSubmittedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(quizSessionStorageKey, JSON.stringify(examSessions))
  }, [examSessions])

  useEffect(() => {
    if (!focusQuizId) return

    const timer = window.setTimeout(() => {
      const targetId = focusQuestionId ? `quiz-question-${focusQuestionId}` : `quiz-${focusQuizId}`
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [focusQuestionId, focusQuizId])

  const filteredQuizzes = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return quizzes.filter((item) => item.status === QuizStatus.Upcoming)
      case 'ongoing':
        return quizzes.filter((item) => item.status === QuizStatus.Ongoing)
      case 'finished':
        return quizzes.filter((item) => item.status === QuizStatus.Finished)
      default:
        return quizzes
    }
  }, [filter, quizzes])

  const detailQuizzes = useMemo(
    () => (focusQuizId ? quizzes.filter((quiz) => quiz.id === focusQuizId) : []),
    [focusQuizId, quizzes],
  )

  const finishedQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.status === QuizStatus.Finished && quiz.score !== undefined),
    [quizzes],
  )

  const cumulativeCoursePerformance = useMemo(() => buildCoursePerformance(finishedQuizzes), [finishedQuizzes])

  const scoreTrend = useMemo(
    () =>
      [...finishedQuizzes]
        .sort((left, right) => parseTime(left.submittedAt) - parseTime(right.submittedAt))
        .slice(-8)
        .map((quiz) => ({
          id: quiz.id,
          label: quiz.title,
          score: quiz.score ?? 0,
          submittedAt: quiz.submittedAt ?? '未记录提交时间',
          courseTitle: `课程 ${quiz.courseId}`,
        })),
    [finishedQuizzes],
  )

  async function submitQuiz(quizId: string) {
    const submitted = await onSubmit(quizId)
    if (!submitted) return

    setSubmittedQuizIds((current) => new Set(current).add(String(quizId)))
    setExamSessions((current) => {
      const next = { ...current }
      delete next[String(quizId)]
      return next
    })
  }

  useEffect(() => {
    filteredQuizzes.forEach((quiz) => {
      if (quiz.status === QuizStatus.Finished) return

      const startedAt = examSessions[quiz.id]
      if (!startedAt || submittingKey === `quiz:${quiz.id}` || autoSubmittedRef.current.has(quiz.id)) return

      const remainingSeconds = Math.max(0, quiz.durationMinutes * 60 - Math.floor((now - startedAt) / 1000))
      if (remainingSeconds === 0) {
        autoSubmittedRef.current.add(quiz.id)
        void submitQuiz(quiz.id)
      }
    })
  }, [examSessions, filteredQuizzes, now, submittingKey])

  function startQuiz(quizId: string) {
    setExamSessions((current) => ({ ...current, [quizId]: current[quizId] ?? Date.now() }))
  }

  function getQuizSessionView(quiz: Quiz) {
    const startedAt = examSessions[quiz.id]
    const remainingSeconds =
      startedAt && quiz.status !== QuizStatus.Finished
        ? Math.max(0, quiz.durationMinutes * 60 - Math.floor((now - startedAt) / 1000))
        : quiz.durationMinutes * 60

    return {
      remainingSeconds,
      submittedLocally: submittedQuizIds.has(String(quiz.id)),
      isExamStarted: quiz.status === QuizStatus.Finished || Boolean(startedAt),
    }
  }

  return {
    filter,
    setFilter,
    filteredQuizzes,
    detailQuizzes,
    finishedQuizzes,
    cumulativeCoursePerformance,
    scoreTrend,
    getQuizSessionView,
    startQuiz,
    submitQuiz,
  }
}
