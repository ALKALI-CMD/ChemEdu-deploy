import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { QuizAnswerRecord } from '@/objects/course/learning/QuizAnswerRecord'

export const quizStatusLabel: Record<QuizStatus, string> = {
  [QuizStatus.Upcoming]: '即将开始',
  [QuizStatus.Ongoing]: '进行中',
  [QuizStatus.Finished]: '已完成',
}

export const questionTypeLabel: Record<QuizQuestionType, string> = {
  [QuizQuestionType.SingleChoice]: '单选题',
  [QuizQuestionType.MultipleChoice]: '多选题',
  [QuizQuestionType.TrueFalse]: '判断题',
  [QuizQuestionType.FillBlank]: '填空题',
  [QuizQuestionType.Subjective]: '主观题',
}

export const quizSessionStorageKey = 'education-quiz-sessions'

export type CoursePerformanceCard = {
  courseId: string
  courseTitle: string
  finishedCount: number
  averageScore: number
  averageAccuracy?: number
  latestSubmittedAt?: string
}

export type QuestionScoreTrend = {
  id: string
  label: string
  earnedPoints: number
  totalPoints: number
  cumulative: number
  questionType: QuizQuestionType
}

export function getQuestionAnswerRecord(quiz: Quiz, questionId: string): QuizAnswerRecord | undefined {
  return quiz.objectiveAnswerRecord.find((record) => record.questionId === questionId)
}

export function formatAnswers(values: string[]) {
  return values.length > 0 ? values.join('、') : '未作答'
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function parseTime(value?: string) {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function getQuizTimeWindow(quiz: Quiz) {
  if (quiz.submittedAt) {
    return `提交时间：${quiz.submittedAt}`
  }
  if (quiz.status === QuizStatus.Ongoing) {
    return `考试窗口：当前开放 / 限时 ${quiz.durationMinutes} 分钟`
  }
  if (quiz.status === QuizStatus.Upcoming) {
    return `考试窗口：待教师开放 / 限时 ${quiz.durationMinutes} 分钟`
  }
  return `考试窗口：已结束 / 限时 ${quiz.durationMinutes} 分钟`
}

export function readQuizSessions() {
  try {
    const raw = window.localStorage.getItem(quizSessionStorageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, number>
    return parsed ?? {}
  } catch {
    return {}
  }
}

export function inferKnowledgePoint(prompt: string, explanation?: string, questionType?: QuizQuestionType) {
  const candidate = explanation?.trim() || prompt.trim()
  const shortened = candidate.replace(/^[：:]/, '').split(/[，。；：:]/)[0].trim()
  if (shortened && shortened.length <= 14) return shortened
  return `${questionType ? questionTypeLabel[questionType] : '综合'}基础`
}

export function getObjectiveSummary(quiz: Quiz) {
  const objectiveQuestions = quiz.questionBank.filter((question) => question.questionType !== QuizQuestionType.Subjective)
  const totalPoints = objectiveQuestions.reduce((sum, question) => sum + question.points, 0)
  const earnedPoints = objectiveQuestions.reduce((sum, question) => {
    const answerRecord = getQuestionAnswerRecord(quiz, question.id)
    return sum + (answerRecord?.correct ? question.points : 0)
  }, 0)
  const accuracy =
    objectiveQuestions.length > 0
      ? Math.round((objectiveQuestions.filter((question) => getQuestionAnswerRecord(quiz, question.id)?.correct).length / objectiveQuestions.length) * 100)
      : undefined

  return {
    totalQuestions: objectiveQuestions.length,
    totalPoints,
    earnedPoints,
    accuracy,
  }
}

export function getTypeStats(quiz: Quiz) {
  const stats = new Map<
    QuizQuestionType,
    { total: number; totalPoints: number; correct: number; wrong: number; earnedPoints: number }
  >()

  quiz.questionBank.forEach((question) => {
    const current = stats.get(question.questionType) ?? { total: 0, totalPoints: 0, correct: 0, wrong: 0, earnedPoints: 0 }
    current.total += 1
    current.totalPoints += question.points
    const answerRecord = getQuestionAnswerRecord(quiz, question.id)
    if (answerRecord) {
      if (answerRecord.correct) {
        current.correct += 1
        current.earnedPoints += question.points
      } else {
        current.wrong += 1
      }
    }
    stats.set(question.questionType, current)
  })

  return Array.from(stats.entries())
}

export function buildQuestionScoreTrend(quiz: Quiz): QuestionScoreTrend[] {
  let cumulative = 0
  return quiz.questionBank.map((question, index) => {
    const answerRecord = getQuestionAnswerRecord(quiz, question.id)
    const earnedPoints =
      question.questionType === QuizQuestionType.Subjective
        ? Math.round(((quiz.subjectiveScore ?? 0) / Math.max(1, quiz.subjectiveQuestionCount || 1)) * 10) / 10
        : answerRecord?.correct
          ? question.points
          : 0
    cumulative += earnedPoints
    return {
      id: question.id,
      label: `第 ${index + 1} 题`,
      earnedPoints,
      totalPoints: question.points,
      cumulative,
      questionType: question.questionType,
    }
  })
}

export function buildKnowledgePointStats(quiz: Quiz) {
  const stats = new Map<string, { label: string; total: number; correct: number; wrong: number; earnedPoints: number; totalPoints: number }>()

  quiz.questionBank.forEach((question) => {
    const key = inferKnowledgePoint(question.prompt, question.explanation, question.questionType)
    const current = stats.get(key) ?? { label: key, total: 0, correct: 0, wrong: 0, earnedPoints: 0, totalPoints: 0 }
    current.total += 1
    current.totalPoints += question.points
    const record = getQuestionAnswerRecord(quiz, question.id)
    if (question.questionType === QuizQuestionType.Subjective) {
      current.earnedPoints += quiz.subjectiveScore ?? 0
    } else if (record?.correct) {
      current.correct += 1
      current.earnedPoints += question.points
    } else {
      current.wrong += 1
    }
    stats.set(key, current)
  })

  return Array.from(stats.values())
    .map((item) => ({
      ...item,
      accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
    }))
    .sort((left, right) => right.total - left.total)
}

export function buildCoursePerformance(quizzes: Quiz[]): CoursePerformanceCard[] {
  const grouped = new Map<string, Quiz[]>()
  quizzes.forEach((quiz) => {
    const current = grouped.get(quiz.courseId) ?? []
    current.push(quiz)
    grouped.set(quiz.courseId, current)
  })

  return Array.from(grouped.entries())
    .map(([courseId, courseQuizzes]) => {
      const finished = courseQuizzes.filter((quiz) => quiz.status === QuizStatus.Finished && quiz.score !== undefined)
      const averageScore = finished.length > 0 ? Number((finished.reduce((sum, quiz) => sum + (quiz.score ?? 0), 0) / finished.length).toFixed(1)) : 0
      const objectiveAccuracies = finished.map((quiz) => getObjectiveSummary(quiz).accuracy).filter((value): value is number => value !== undefined)
      const averageAccuracy =
        objectiveAccuracies.length > 0
          ? Math.round(objectiveAccuracies.reduce((sum, value) => sum + value, 0) / objectiveAccuracies.length)
          : undefined

      return {
        courseId,
        courseTitle: `课程 ${courseId}`,
        finishedCount: finished.length,
        averageScore,
        averageAccuracy,
        latestSubmittedAt: [...finished].sort((left, right) => parseTime(right.submittedAt) - parseTime(left.submittedAt))[0]?.submittedAt,
      }
    })
    .sort((left, right) => parseTime(right.latestSubmittedAt) - parseTime(left.latestSubmittedAt))
}

export function buildWrongMasteryProgress(quiz: Quiz, finishedQuizzes: Quiz[]) {
  const knowledgeStats = buildKnowledgePointStats(quiz)
  const knowledgeAverageAcrossCourse = new Map<string, number>()

  finishedQuizzes
    .filter((item) => item.courseId === quiz.courseId)
    .forEach((courseQuiz) => {
      buildKnowledgePointStats(courseQuiz).forEach((stat) => {
        const current = knowledgeAverageAcrossCourse.get(stat.label)
        knowledgeAverageAcrossCourse.set(stat.label, current === undefined ? stat.accuracy : Math.round((current + stat.accuracy) / 2))
      })
    })

  return quiz.questionBank
    .filter((question) => quiz.wrongQuestionIds.includes(question.id))
    .map((question) => {
      const label = inferKnowledgePoint(question.prompt, question.explanation, question.questionType)
      const courseAccuracy = knowledgeAverageAcrossCourse.get(label) ?? knowledgeStats.find((item) => item.label === label)?.accuracy ?? 0
      const masteryLevel = courseAccuracy >= 80 ? '已掌握' : courseAccuracy >= 50 ? '正在巩固' : '仍需重练'
      return {
        id: question.id,
        label,
        prompt: question.prompt,
        masteryLevel,
        courseAccuracy,
      }
    })
}
