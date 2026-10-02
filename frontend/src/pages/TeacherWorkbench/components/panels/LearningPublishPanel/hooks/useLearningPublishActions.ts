import type { PublishAssignmentPayload } from '@/api/course/learning/PublishAssignmentAPIMessage'
import type { PublishQuizPayload } from '@/api/course/learning/PublishQuizAPIMessage'
import { QuizQuestionType } from '@/objects/course/learning/QuizQuestionType'
import { zh } from '@/lib/localization'
import type { useLearningPublishState } from './useLearningPublishState'
import {
  deriveObjectiveAnswerKeys,
  parseReferenceAttachments,
  parseRubric,
  parseStructuredQuestionBank,
} from '../functions/learningPublishParsers'

type LearningPublishActionsOptions = {
  state: ReturnType<typeof useLearningPublishState>
  onPublishAssignment: (payload: PublishAssignmentPayload) => Promise<void>
  onPublishQuiz: (payload: PublishQuizPayload) => Promise<void>
}

export function useLearningPublishActions({
  state,
  onPublishAssignment,
  onPublishQuiz,
}: LearningPublishActionsOptions) {
  async function handlePublishAssignment() {
    state.setFormError(null)

    if (!state.assignmentTitle.trim() || !state.assignmentDescription.trim() || !state.assignmentDeadline.trim()) {
      state.setFormError('发布作业前请填写作业标题、作业要求和截止时间。')
      return
    }

    const currentCourse = state.courseOptions.find((course) => course.id === state.assignmentCourseId)

    try {
      await onPublishAssignment({
        courseId: state.assignmentCourseId || state.courseOptions[0]?.id || '',
        title: state.assignmentTitle,
        description: state.assignmentDescription,
        deadline: state.assignmentDeadline,
        attachmentLabel: state.assignmentAttachmentLabel,
        maxAttempts: Math.max(1, Number(state.assignmentMaxAttempts) || 1),
        allowLateSubmission: state.allowLateSubmission,
        allowResubmission: state.allowResubmission,
        allowMakeUpSubmission: state.allowMakeUpSubmission,
        lateSubmissionDeadline: state.lateSubmissionDeadline || undefined,
        latePenaltyPercentPerDay: Math.max(0, Number(state.latePenaltyPercentPerDay) || 0),
        latePenaltyCapPercent: Math.max(0, Math.min(100, Number(state.latePenaltyCapPercent) || 0)),
        rubric: parseRubric(state.assignmentRubricText),
        referenceAttachments: parseReferenceAttachments(state.assignmentReferenceLabels),
      })
      state.setPublishSuccess({
        type: 'assignment',
        courseId: state.assignmentCourseId,
        courseTitle: zh(currentCourse?.title ?? '未选择课程'),
        title: state.assignmentTitle,
        deadline: state.assignmentDeadline,
      })
      state.setAssignmentTitle('')
      state.setAssignmentDescription('')
      state.setAssignmentDeadline('')
      state.setAssignmentAttachmentLabel('')
      state.setAssignmentMaxAttempts('2')
      state.setAllowLateSubmission(true)
      state.setAllowResubmission(true)
      state.setAllowMakeUpSubmission(false)
      state.setLateSubmissionDeadline('')
      state.setLatePenaltyPercentPerDay('0')
      state.setLatePenaltyCapPercent('0')
      state.setAssignmentRubricText('')
      state.setAssignmentReferenceLabels('')
      state.setPreviewMode(null)
    } catch (error) {
      state.setFormError(error instanceof Error ? error.message : '发布作业失败，请稍后重试。')
    }
  }

  async function handlePublishQuiz() {
    state.setFormError(null)

    const duration = Number(state.durationMinutes)
    const structuredQuestionBank = parseStructuredQuestionBank(state.questionBankText)
    const manualObjectiveCount = Number(state.objectiveQuestionCount)
    const manualSubjectiveCount = Number(state.subjectiveQuestionCount)
    const normalizedDrawCount = state.drawCount.trim() ? Math.max(1, Number(state.drawCount)) : undefined

    if (!state.quizTitle.trim()) {
      state.setFormError('发布测验前请填写测验标题。')
      return
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      state.setFormError('请填写有效的考试时长。')
      return
    }

    if (normalizedDrawCount !== undefined && (!Number.isFinite(normalizedDrawCount) || normalizedDrawCount <= 0)) {
      state.setFormError('随机抽题数必须是大于 0 的整数，留空则表示整卷发放。')
      return
    }

    try {
      const effectiveQuestionBank = structuredQuestionBank
      const effectiveObjectiveCount =
        effectiveQuestionBank.length > 0
          ? effectiveQuestionBank.filter((question) => question.questionType !== QuizQuestionType.Subjective).length
          : manualObjectiveCount
      const effectiveSubjectiveCount =
        effectiveQuestionBank.length > 0
          ? effectiveQuestionBank.filter((question) => question.questionType === QuizQuestionType.Subjective).length
          : manualSubjectiveCount
      const derivedAnswerKeys =
        effectiveQuestionBank.length > 0 ? deriveObjectiveAnswerKeys(effectiveQuestionBank) : state.parseAnswerKeys(state.answerKeys)

      if (
        !Number.isInteger(effectiveObjectiveCount) ||
        !Number.isInteger(effectiveSubjectiveCount) ||
        effectiveObjectiveCount < 0 ||
        effectiveSubjectiveCount < 0
      ) {
        state.setFormError('请填写有效的客观题和主观题数量。')
        return
      }

      if (effectiveQuestionBank.some((question) => question.questionType !== QuizQuestionType.Subjective && question.correctAnswers.length === 0)) {
        state.setFormError('每道客观题都需要至少填写一个正确答案。')
        return
      }

      if (normalizedDrawCount !== undefined && effectiveQuestionBank.length > 0 && normalizedDrawCount > effectiveQuestionBank.length) {
        state.setFormError('随机抽题数不能超过题库总题数。')
        return
      }

      if (effectiveQuestionBank.length === 0 && derivedAnswerKeys.length !== effectiveObjectiveCount) {
        state.setFormError('客观题答案键数量必须与客观题数量一致。')
        return
      }

      const currentCourse = state.courseOptions.find((course) => course.id === state.quizCourseId)

      await onPublishQuiz({
        courseId: state.quizCourseId || state.courseOptions[0]?.id || '',
        title: state.quizTitle,
        durationMinutes: duration,
        objectiveQuestionCount: effectiveObjectiveCount,
        subjectiveQuestionCount: effectiveSubjectiveCount,
        drawCount: normalizedDrawCount,
        shuffleQuestions: state.shuffleQuestions,
        shuffleOptions: state.shuffleOptions,
        answerKeys: derivedAnswerKeys,
        questionBank: effectiveQuestionBank,
      })
      state.setPublishSuccess({
        type: 'quiz',
        courseId: state.quizCourseId,
        courseTitle: zh(currentCourse?.title ?? '未选择课程'),
        title: state.quizTitle,
        durationMinutes: duration,
      })
      state.setQuizTitle('')
      state.setDurationMinutes('20')
      state.setObjectiveQuestionCount('5')
      state.setSubjectiveQuestionCount('0')
      state.setDrawCount('')
      state.setShuffleQuestions(true)
      state.setShuffleOptions(false)
      state.setAnswerKeys('')
      state.setQuestionBankText('')
      state.setPreviewMode(null)
    } catch (error) {
      state.setFormError(error instanceof Error ? error.message : '发布测验失败，请稍后重试。')
    }
  }

  return {
    handlePublishAssignment,
    handlePublishQuiz,
  }
}
