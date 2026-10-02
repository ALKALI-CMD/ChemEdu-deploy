import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { GradeDetailItem, GradeTrendPoint, LatestScoreItem } from '../objects/studentCenterTypes'
import type { StudentCenterSourceModel } from './studentCenterSourceModel'
import { formatGradeFormula, parseTimelineTime, text } from './studentCenterModelUtils'

export function buildLatestScores({
  studentGradebook,
  studentAssignments,
  studentQuizzes,
  courseTitleMap,
}: Pick<StudentCenterSourceModel, 'studentGradebook' | 'studentAssignments' | 'studentQuizzes' | 'courseTitleMap'>) {
  const latestScores: LatestScoreItem[] = [
    ...studentGradebook.map((entry) => {
      const latestAssignmentTime = studentAssignments
        .filter((assignment) => assignment.courseId === entry.courseId)
        .map((assignment) => assignment.reviewedAt ?? assignment.submittedAt ?? '')
        .sort((left, right) => parseTimelineTime(right) - parseTimelineTime(left))[0]
      const latestQuizTime = studentQuizzes
        .filter((quiz) => quiz.courseId === entry.courseId)
        .map((quiz) => quiz.submittedAt ?? '')
        .sort((left, right) => parseTimelineTime(right) - parseTimelineTime(left))[0]
      const timestamp = [latestAssignmentTime, latestQuizTime]
        .filter((value) => value)
        .sort((left, right) => parseTimelineTime(right) - parseTimelineTime(left))[0] ?? ''

      return {
        id: `course-score-${entry.courseId}`,
        category: 'course' as const,
        title: `${entry.courseTitle} 总评`,
        subtitle: formatGradeFormula(entry.assignmentWeight, entry.quizWeight, entry.progressWeight),
        score: entry.totalScore,
        timestamp,
      }
    }),
    ...studentAssignments
      .filter((assignment) => assignment.score !== undefined)
      .map((assignment) => ({
        id: `assignment-score-${assignment.id}`,
        category: 'assignment' as const,
        title: text(assignment.title),
        subtitle: courseTitleMap.get(assignment.courseId) ?? '',
        score: Number(assignment.score),
        timestamp: assignment.reviewedAt ?? assignment.submittedAt ?? '',
      })),
    ...studentQuizzes
      .filter((quiz) => quiz.score !== undefined)
      .map((quiz) => ({
        id: `quiz-score-${quiz.id}`,
        category: 'quiz' as const,
        title: text(quiz.title),
        subtitle: courseTitleMap.get(quiz.courseId) ?? '',
        score: Number(quiz.score),
        timestamp: quiz.submittedAt ?? '',
      })),
  ].sort((left, right) => parseTimelineTime(right.timestamp) - parseTimelineTime(left.timestamp))

  return latestScores
}

export function buildGradeDetails({
  studentGradebook,
  studentAssignments,
  studentQuizzes,
  latestScores,
  courseTitleMap,
}: Pick<StudentCenterSourceModel, 'studentGradebook' | 'studentAssignments' | 'studentQuizzes' | 'courseTitleMap'> & {
  latestScores: LatestScoreItem[]
}) {
  const gradeDetails: GradeDetailItem[] = [
    ...studentGradebook.map((entry) => ({
      id: `course-grade-${entry.courseId}`,
      courseId: entry.courseId,
      courseTitle: courseTitleMap.get(entry.courseId) ?? '',
      category: 'course' as const,
      title: `${entry.courseTitle} 总评`,
      score: entry.totalScore,
      status: `${formatGradeFormula(entry.assignmentWeight, entry.quizWeight, entry.progressWeight)} · 任务完成率 ${entry.completedTaskRate}`,
      timestamp: latestScores.find((item) => item.category === 'course' && item.id === `course-score-${entry.courseId}`)?.timestamp,
    })),
    ...studentAssignments.map((assignment) => ({
      id: `assignment-${assignment.id}`,
      courseId: assignment.courseId,
      courseTitle: courseTitleMap.get(assignment.courseId) ?? '',
      category: 'assignment' as const,
      title: text(assignment.title),
      score: assignment.score,
      status:
        assignment.submissionStatus === SubmissionStatus.Reviewed
          ? '已批改'
          : assignment.submissionStatus === SubmissionStatus.Submitted
            ? '待批改'
            : '待提交',
      timestamp: assignment.reviewedAt ?? assignment.submittedAt,
    })),
    ...studentQuizzes.map((quiz) => ({
      id: `quiz-${quiz.id}`,
      courseId: quiz.courseId,
      courseTitle: courseTitleMap.get(quiz.courseId) ?? '',
      category: 'quiz' as const,
      title: text(quiz.title),
      score: quiz.score,
      status:
        quiz.status === QuizStatus.Finished
          ? '已提交'
          : quiz.status === QuizStatus.Ongoing
            ? '进行中'
            : '即将开始',
      timestamp: quiz.submittedAt,
    })),
  ].sort((left, right) => parseTimelineTime(right.timestamp) - parseTimelineTime(left.timestamp))

  return gradeDetails
}

export function buildGradeTrend({
  studentAssignments,
  studentQuizzes,
  studentGradebook,
  gradeDetails,
}: Pick<StudentCenterSourceModel, 'studentAssignments' | 'studentQuizzes' | 'studentGradebook'> & {
  gradeDetails: GradeDetailItem[]
}) {
  const gradeTrend: GradeTrendPoint[] = [
    ...studentAssignments
      .filter((assignment) => assignment.score !== undefined)
      .map((assignment) => ({
        id: `trend-assignment-${assignment.id}`,
        label: text(assignment.title),
        score: assignment.score ?? 0,
        timestamp: assignment.reviewedAt ?? assignment.submittedAt ?? '',
        category: 'assignment' as const,
      })),
    ...studentQuizzes
      .filter((quiz) => quiz.score !== undefined)
      .map((quiz) => ({
        id: `trend-quiz-${quiz.id}`,
        label: text(quiz.title),
        score: quiz.score ?? 0,
        timestamp: quiz.reviewedAt ?? quiz.submittedAt ?? '',
        category: 'quiz' as const,
      })),
    ...studentGradebook.map((entry) => ({
      id: `trend-course-${entry.courseId}`,
      label: `${text(entry.courseTitle)} 总评`,
      score: entry.totalScore,
      timestamp: gradeDetails.find((item) => item.courseId === entry.courseId)?.timestamp ?? '',
      category: 'course' as const,
    })),
  ]
    .filter((item) => item.timestamp)
    .sort((left, right) => parseTimelineTime(left.timestamp) - parseTimelineTime(right.timestamp))
    .slice(-10)

  return gradeTrend
}
