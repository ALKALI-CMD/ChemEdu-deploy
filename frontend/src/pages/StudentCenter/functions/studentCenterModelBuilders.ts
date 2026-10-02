import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { buildTimelineItems, buildWrongQuestions } from './studentCenterActivityModel'
import { getAssignmentPriority, getQuizPriority, groupTimelineItems, parseTimelineTime } from './studentCenterModelUtils'
import { buildGradeDetails, buildGradeTrend, buildLatestScores } from './studentCenterScoreModel'
import { buildStudentCenterSourceModel } from './studentCenterSourceModel'

export function buildStudentCenterModel(dashboard: EducationDashboardResponse) {
  const sourceModel = buildStudentCenterSourceModel(dashboard)

  const prioritizedAssignments = [...sourceModel.studentAssignments].sort((left, right) => {
    const priorityGap = getAssignmentPriority(left) - getAssignmentPriority(right)
    if (priorityGap !== 0) return priorityGap
    return parseTimelineTime(left.deadline) - parseTimelineTime(right.deadline)
  })

  const prioritizedQuizzes = [...sourceModel.studentQuizzes].sort((left, right) => {
    const priorityGap = getQuizPriority(left) - getQuizPriority(right)
    if (priorityGap !== 0) return priorityGap
    return parseTimelineTime(left.submittedAt) - parseTimelineTime(right.submittedAt)
  })

  const latestScores = buildLatestScores({
    studentGradebook: sourceModel.studentGradebook,
    studentAssignments: sourceModel.studentAssignments,
    studentQuizzes: sourceModel.studentQuizzes,
    courseTitleMap: sourceModel.courseTitleMap,
  })
  const wrongQuestions = buildWrongQuestions({ prioritizedQuizzes, courseTitleMap: sourceModel.courseTitleMap })
  const gradeDetails = buildGradeDetails({
    studentGradebook: sourceModel.studentGradebook,
    studentAssignments: sourceModel.studentAssignments,
    studentQuizzes: sourceModel.studentQuizzes,
    latestScores,
    courseTitleMap: sourceModel.courseTitleMap,
  })
  const gradeTrend = buildGradeTrend({
    studentAssignments: sourceModel.studentAssignments,
    studentQuizzes: sourceModel.studentQuizzes,
    studentGradebook: sourceModel.studentGradebook,
    gradeDetails,
  })
  const timelineItems = buildTimelineItems({
    prioritizedAssignments,
    prioritizedQuizzes,
    enrolledCourses: sourceModel.enrolledCourses,
    courseTitleMap: sourceModel.courseTitleMap,
  })

  return {
    ...sourceModel,
    prioritizedAssignments,
    prioritizedQuizzes,
    latestScores,
    wrongQuestions,
    gradeDetails,
    gradeTrend,
    groupedTimeline: groupTimelineItems(timelineItems),
    navCounts: {
      '/student/assignments': sourceModel.studentAssignments.filter((item) => item.submissionStatus === SubmissionStatus.Pending).length,
      '/student/quizzes': sourceModel.studentQuizzes.filter((item) => item.status !== QuizStatus.Finished).length,
    },
  }
}
