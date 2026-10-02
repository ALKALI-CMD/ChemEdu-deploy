import { useState } from 'react'
import type { NoticeState } from '@/components/ExperienceState'
import { UserRole } from '@/objects/auth/UserRole'
import type { UserId } from '@/objects/auth/UserId'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'
import type { AssignmentRubricScore } from '@/objects/course/learning/AssignmentRubricScore'
import type { TeacherAnnotation } from '@/objects/course/learning/TeacherAnnotation'
import type { PublishAssignmentPayload } from '@/api/course/learning/PublishAssignmentAPIMessage'
import type { PublishQuizPayload } from '@/api/course/learning/PublishQuizAPIMessage'
import { filesToAssignmentAttachments } from '@/lib/assignment-attachments'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试。'
}

function useTeacherWorkbenchActions({
  dashboardApi,
  currentUser,
  defaultTeacherId,
  canDirectPublishCourse,
  assignmentsById,
  scoreDrafts,
  rubricScoreDrafts,
  rubricCommentDrafts,
  feedbackDrafts,
  annotationDrafts,
  setReviewAttachmentDrafts,
  setSubmittingAssignmentId,
  setPublishingLearningTask,
  setSelectedCourseIds,
}: {
  dashboardApi: Pick<
    {
      publishAssignment: (payload: PublishAssignmentPayload) => Promise<unknown>
      publishQuiz: (payload: PublishQuizPayload) => Promise<unknown>
      reviewAssignment: (
        assignmentId: string,
        score: number,
        feedback: string,
        attachments: AssignmentAttachment[],
        rubricScores?: AssignmentRubricScore[],
        teacherAnnotations?: TeacherAnnotation[],
      ) => Promise<unknown>
      saveCourse: (input: CourseEditorInput) => Promise<unknown>
      updateCourseStatus: (courseId: string, nextStatus: CourseStatus) => Promise<unknown>
      moderateDiscussionTopic: (
        topicId: string,
        visibility: DiscussionVisibility,
        threadState: DiscussionThreadState,
        pinState: DiscussionPinState,
        resolved: boolean,
      ) => Promise<unknown>
    },
    'publishAssignment' | 'publishQuiz' | 'reviewAssignment' | 'saveCourse' | 'updateCourseStatus' | 'moderateDiscussionTopic'
  >
  currentUser: { id: UserId; role: UserRole }
  defaultTeacherId?: UserId
  canDirectPublishCourse: boolean
  assignmentsById: Map<string, Assignment>
  scoreDrafts: Record<string, string>
  rubricScoreDrafts: Record<string, Record<string, string>>
  rubricCommentDrafts: Record<string, Record<string, string>>
  feedbackDrafts: Record<string, string>
  annotationDrafts: Record<string, string>
  setReviewAttachmentDrafts: React.Dispatch<React.SetStateAction<Record<string, AssignmentAttachment[]>>>
  setSubmittingAssignmentId: (value: string | null) => void
  setPublishingLearningTask: (value: boolean) => void
  setSelectedCourseIds: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const { publishAssignment, publishQuiz, reviewAssignment, saveCourse, updateCourseStatus, moderateDiscussionTopic } =
    dashboardApi
  const [notice, setNotice] = useState<NoticeState>(null)

  async function handleSaveCourse(input: CourseEditorInput) {
    setNotice(null)
    const normalizedStatus =
      canDirectPublishCourse || input.status !== CourseStatus.Published ? input.status : CourseStatus.Draft

    try {
      await saveCourse({
        ...input,
        status: normalizedStatus,
        teacherId: currentUser.role === UserRole.Admin ? input.teacherId ?? defaultTeacherId : currentUser.id,
      })
      setNotice({
        tone: 'success',
        title: '课程保存成功',
        message: canDirectPublishCourse
          ? '课程信息已经写入系统，课程列表和课程详情会同步刷新。'
          : '课程已保存为草稿并重新进入待审核状态，管理员审核通过后才能发布。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '课程保存失败',
        message: getErrorMessage(error),
      })
    }
  }

  async function handleToggleCourseStatus(courseId: string, nextStatus: CourseStatus) {
    try {
      await updateCourseStatus(courseId, nextStatus)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  async function handleBatchStatusChange(courseIds: string[], nextStatus: CourseStatus) {
    setNotice(null)

    try {
      for (const courseId of courseIds) {
        await handleToggleCourseStatus(courseId, nextStatus)
      }

      const statusMessage =
        nextStatus === CourseStatus.Published ? '已批量提交发布' : nextStatus === CourseStatus.Archived ? '已批量下架' : '已批量转为草稿'

      setNotice({
        tone: 'success',
        title: '批量操作已完成',
        message: `共处理 ${courseIds.length} 门课程，当前结果：${statusMessage}。`,
      })
      setSelectedCourseIds([])
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '批量操作失败',
        message: getErrorMessage(error),
      })
    }
  }

  async function handleSelectReviewFiles(assignmentId: string, files: FileList | null) {
    const attachments = await filesToAssignmentAttachments(files, AssignmentAttachmentType.Review)
    setReviewAttachmentDrafts((current) => ({ ...current, [assignmentId]: attachments }))
  }

  async function handleReviewAssignment(assignmentId: string, attachments: AssignmentAttachment[]) {
    setNotice(null)
    const score = Number(scoreDrafts[assignmentId] ?? '')
    const feedback = feedbackDrafts[assignmentId] ?? ''
    const assignment = assignmentsById.get(assignmentId)

    if (Number.isNaN(score) || score < 0 || score > 100) {
      setNotice({
        tone: 'error',
        title: '批改未提交',
        message: '请输入 0 到 100 之间的分数。',
      })
      return
    }

    if (!feedback.trim()) {
      setNotice({
        tone: 'error',
        title: '批改未提交',
        message: '请填写评语。',
      })
      return
    }

    setSubmittingAssignmentId(assignmentId)
    try {
      const rubricScores: AssignmentRubricScore[] =
        assignment?.rubric.map((criterion) => ({
          criterionId: criterion.id,
          score: Math.max(0, Math.min(criterion.maxScore, Number(rubricScoreDrafts[assignmentId]?.[criterion.id] ?? criterion.maxScore))),
          comment: rubricCommentDrafts[assignmentId]?.[criterion.id]?.trim()
            ? rubricCommentDrafts[assignmentId][criterion.id].trim()
            : undefined,
        })) ?? []
      const teacherAnnotations: TeacherAnnotation[] = annotationDrafts[assignmentId]?.trim()
        ? [
            {
              id: `annotation-${assignmentId}`,
              author: '教师',
              body: annotationDrafts[assignmentId].trim(),
              createdAt: new Date().toISOString(),
            },
          ]
        : []

      await reviewAssignment(
        assignmentId,
        score,
        feedback.trim(),
        attachments,
        rubricScores,
        teacherAnnotations,
      )
      setReviewAttachmentDrafts((current) => ({ ...current, [assignmentId]: [] }))
      setNotice({
        tone: 'success',
        title: '批改提交成功',
        message: '分数、评语和反馈附件已经保存，学生中心会同步显示最新结果。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '批改提交失败',
        message: getErrorMessage(error),
      })
    } finally {
      setSubmittingAssignmentId(null)
    }
  }

  async function handlePublishAssignment(payload: PublishAssignmentPayload) {
    setNotice(null)

    if (!payload.courseId) {
      setNotice({
        tone: 'error',
        title: '作业未发布',
        message: '请先选择课程。',
      })
      return
    }

    if (!payload.title.trim() || !payload.description.trim() || !payload.deadline.trim()) {
      setNotice({
        tone: 'error',
        title: '作业未发布',
        message: '请填写作业标题、作业要求和截止时间。',
      })
      return
    }

    setPublishingLearningTask(true)
    try {
      await publishAssignment(payload)
      setNotice({
        tone: 'success',
        title: '作业发布成功',
        message: '作业已经分发给当前已报名学生，后续新报名学生也会自动获得该作业。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '作业发布失败',
        message: getErrorMessage(error),
      })
    } finally {
      setPublishingLearningTask(false)
    }
  }

  async function handlePublishQuiz(payload: PublishQuizPayload) {
    setNotice(null)

    if (!payload.courseId) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '请先选择课程。',
      })
      return
    }

    if (!payload.title.trim()) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '请填写测验标题。',
      })
      return
    }

    if (
      !Number.isFinite(payload.durationMinutes) ||
      payload.durationMinutes <= 0 ||
      !Number.isInteger(payload.objectiveQuestionCount) ||
      !Number.isInteger(payload.subjectiveQuestionCount) ||
      payload.objectiveQuestionCount < 0 ||
      payload.subjectiveQuestionCount < 0
    ) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '请填写有效的测验时长和题目数量。',
      })
      return
    }

    if (payload.drawCount !== undefined && (!Number.isInteger(payload.drawCount) || payload.drawCount <= 0)) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '随机抽题数必须是大于 0 的整数，留空则表示整卷发放。',
      })
      return
    }

    if (payload.drawCount !== undefined && payload.questionBank && payload.questionBank.length > 0 && payload.drawCount > payload.questionBank.length) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '随机抽题数不能超过题库总题数。',
      })
      return
    }

    if ((!payload.questionBank || payload.questionBank.length === 0) && payload.answerKeys.length !== payload.objectiveQuestionCount) {
      setNotice({
        tone: 'error',
        title: '测验未发布',
        message: '选择题答案数量必须与客观题题目数量一致。',
      })
      return
    }

    setPublishingLearningTask(true)
    try {
      await publishQuiz(payload)
      setNotice({
        tone: 'success',
        title: '测验发布成功',
        message: '测验已经分发给当前已报名学生，答案配置也已同步保存用于自动判分。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '测验发布失败',
        message: getErrorMessage(error),
      })
    } finally {
      setPublishingLearningTask(false)
    }
  }

  async function handleModerateTopic(
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved = false,
  ) {
    try {
      await moderateDiscussionTopic(topicId, visibility, threadState, pinState, resolved)
      setNotice({
        tone: 'success',
        title: '讨论治理已更新',
        message: '讨论主题的状态已经同步到课程讨论区。',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        title: '讨论治理失败',
        message: getErrorMessage(error),
      })
    }
  }

  return {
    notice,
    setNotice,
    handleSaveCourse,
    handleToggleCourseStatus,
    handleBatchStatusChange,
    handleSelectReviewFiles,
    handleReviewAssignment,
    handlePublishAssignment,
    handlePublishQuiz,
    handleModerateTopic,
  }
}

export { getErrorMessage, useTeacherWorkbenchActions }
