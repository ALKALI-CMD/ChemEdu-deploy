import type { Course } from '@/objects/course/catalog/Course'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import type { TimelineItem, WrongQuestionItem } from '../objects/studentCenterTypes'
import { getAssignmentPriority, getContinueLearningItem, getQuizPriority, parseTimelineTime, text } from './studentCenterModelUtils'

export function buildWrongQuestions({
  prioritizedQuizzes,
  courseTitleMap,
}: {
  prioritizedQuizzes: Quiz[]
  courseTitleMap: Map<string, string>
}) {
  const wrongQuestions: WrongQuestionItem[] = prioritizedQuizzes.flatMap((quiz) =>
    quiz.wrongQuestionIds.flatMap((questionId) => {
      const question = quiz.questionBank.find((item) => item.id === questionId)
      const answerRecord = quiz.objectiveAnswerRecord.find((item) => item.questionId === questionId)
      if (!question || !answerRecord) return []

      return [
        {
          id: `${quiz.id}-${questionId}`,
          courseId: quiz.courseId,
          quizId: quiz.id,
          questionId,
          courseTitle: courseTitleMap.get(quiz.courseId) ?? '',
          quizTitle: text(quiz.title),
          prompt: text(question.prompt),
          questionType: question.questionType,
          submittedAnswers: answerRecord.submittedAnswers,
          correctAnswers: question.correctAnswers,
          explanation: question.explanation ? text(question.explanation) : undefined,
        },
      ]
    }),
  )

  return wrongQuestions
}

export function buildTimelineItems({
  prioritizedAssignments,
  prioritizedQuizzes,
  enrolledCourses,
  courseTitleMap,
}: {
  prioritizedAssignments: Assignment[]
  prioritizedQuizzes: Quiz[]
  enrolledCourses: Course[]
  courseTitleMap: Map<string, string>
}) {
  const timelineItems: TimelineItem[] = [
    ...prioritizedAssignments.map((assignment) => ({
      id: `timeline-assignment-${assignment.id}`,
      category: 'assignment' as const,
      assignmentId: assignment.id,
      title: text(assignment.title),
      subtitle: courseTitleMap.get(assignment.courseId) ?? '课程作业',
      status:
        assignment.submissionStatus === SubmissionStatus.Pending
          ? '待提交'
          : assignment.submissionStatus === SubmissionStatus.Submitted
            ? '待批改'
            : '已批改',
      timestampLabel: `截止时间：${assignment.deadline}`,
      priority: getAssignmentPriority(assignment),
      sortTime: parseTimelineTime(assignment.deadline),
    })),
    ...prioritizedQuizzes.map((quiz) => ({
      id: `timeline-quiz-${quiz.id}`,
      category: 'quiz' as const,
      quizId: quiz.id,
      title: text(quiz.title),
      subtitle: courseTitleMap.get(quiz.courseId) ?? '课程测验',
      status:
        quiz.status === QuizStatus.Ongoing
          ? '进行中'
          : quiz.status === QuizStatus.Upcoming
            ? '即将开始'
            : '已结束',
      timestampLabel:
        quiz.submittedAt && quiz.status === QuizStatus.Finished
          ? `提交时间：${quiz.submittedAt}`
          : '状态已更新',
      priority: getQuizPriority(quiz),
      sortTime: parseTimelineTime(quiz.submittedAt),
    })),
    ...enrolledCourses.map((course) => {
      const nextLesson = getContinueLearningItem([course])
      return {
        id: `timeline-course-${course.id}`,
        category: 'course' as const,
        courseId: course.id,
        lessonId: nextLesson?.lessonId,
        title: text(course.title),
        subtitle: nextLesson
          ? `继续学习第 ${nextLesson.moduleIndex + 1} 章第 ${nextLesson.lessonIndex + 1} 节`
          : '打开课程目录',
        status: `进度 ${course.completionRate}%`,
        timestampLabel: text(course.schedule),
        priority: 2,
        sortTime: Number.MAX_SAFE_INTEGER - Number(course.completionRate),
      }
    }),
  ].sort((left, right) => {
    const priorityGap = left.priority - right.priority
    if (priorityGap !== 0) return priorityGap
    return left.sortTime - right.sortTime
  })

  return timelineItems
}
