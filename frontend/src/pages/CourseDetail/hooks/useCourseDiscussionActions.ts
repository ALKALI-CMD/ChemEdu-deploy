import { useEffect, useState } from 'react'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import type { NoticeState } from '@/components/ExperienceState'
import type { Course } from '@/objects/course/catalog/Course'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'

type CourseDiscussionActionOptions = {
  course?: Course
  focusLessonId?: string
  actions: Pick<
    EducationDashboardContextValue,
    | 'createDiscussionTopic'
    | 'createPlatformReport'
    | 'deleteDiscussionReply'
    | 'deleteDiscussionTopic'
    | 'moderateDiscussionReply'
    | 'moderateDiscussionTopic'
    | 'replyDiscussionTopic'
    | 'toggleDiscussionReaction'
    | 'updateDiscussionReply'
    | 'updateDiscussionTopic'
  >
  setNotice: (notice: NoticeState) => void
}

export function useCourseDiscussionActions({
  course,
  focusLessonId,
  actions,
  setNotice,
}: CourseDiscussionActionOptions) {
  const [topicTitle, setTopicTitle] = useState('')
  const [topicContent, setTopicContent] = useState('')
  const [composerLessonId, setComposerLessonId] = useState<string>(focusLessonId ?? 'general')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [discussionSubmittingKey, setDiscussionSubmittingKey] = useState<string | null>(null)

  useEffect(() => {
    setComposerLessonId(focusLessonId ?? 'general')
  }, [focusLessonId, course?.id])

  function requireCourse(): Course {
    if (!course) {
      throw new Error('课程不存在，无法执行当前讨论操作。')
    }
    return course
  }

  async function handleCreateDiscussionTopic(lessonId?: string) {
    const activeCourse = requireCourse()
    if (!topicTitle.trim() || !topicContent.trim()) {
      setNotice({
        tone: 'error',
        title: '讨论未发布',
        message: '请填写讨论标题和内容。',
      })
      return
    }

    setDiscussionSubmittingKey('topic')
    setNotice(null)
    try {
      await actions.createDiscussionTopic(activeCourse.id, lessonId, topicTitle.trim(), topicContent.trim())
      setTopicTitle('')
      setTopicContent('')
      if (!focusLessonId) {
        setComposerLessonId('general')
      }
      setNotice({
        tone: 'success',
        title: '讨论发布成功',
        message: '新主题已经发布到当前课程讨论区。',
      })
    } finally {
      setDiscussionSubmittingKey(null)
    }
  }

  async function handleReplyDiscussionTopic(topicId: string) {
    const draftValue = replyDrafts[topicId] ?? ''
    if (!draftValue.trim()) {
      setNotice({
        tone: 'error',
        title: '回复未提交',
        message: '请先填写回复内容。',
      })
      return
    }

    setDiscussionSubmittingKey(`reply:${topicId}`)
    setNotice(null)
    try {
      await actions.replyDiscussionTopic(topicId, draftValue.trim())
      setReplyDrafts((current) => ({ ...current, [topicId]: '' }))
      setNotice({
        tone: 'success',
        title: '回复提交成功',
        message: '你的回复已经同步到讨论列表。',
      })
    } finally {
      setDiscussionSubmittingKey(null)
    }
  }

  async function handleUpdateDiscussionTopic(topicId: string, title: string, content: string) {
    await actions.updateDiscussionTopic(topicId, title.trim(), content.trim())
  }

  async function handleUpdateDiscussionReply(replyId: string, content: string) {
    await actions.updateDiscussionReply(replyId, content.trim())
  }

  async function handleModerateDiscussionTopic(
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: boolean,
    moderationNote?: string,
  ) {
    await actions.moderateDiscussionTopic(
      topicId,
      visibility,
      threadState,
      pinState,
      resolved,
      moderationNote ? moderationNote.trim() : undefined,
    )
  }

  async function handleModerateDiscussionReply(replyId: string, visibility: DiscussionVisibility, moderationNote?: string) {
    await actions.moderateDiscussionReply(replyId, visibility, moderationNote ? moderationNote.trim() : undefined)
  }

  async function handleDeleteDiscussionTopic(topicId: string) {
    await actions.deleteDiscussionTopic(topicId)
  }

  async function handleDeleteDiscussionReply(replyId: string) {
    await actions.deleteDiscussionReply(replyId)
  }

  async function handleToggleDiscussionReaction(topicId: string, reactionType: 'like' | 'favorite' | 'report') {
    await actions.toggleDiscussionReaction(topicId, reactionType)
  }

  async function handleCreatePlatformReport(
    targetType: string,
    targetId: string,
    targetLabel: string,
    reason: string,
    detail?: string,
  ) {
    const report = await actions.createPlatformReport(targetType, targetId, targetLabel, reason, detail)
    setNotice({
      tone: 'success',
      title: '举报已提交',
      message: '管理员会在内容治理中处理该举报。',
    })
    return report
  }

  return {
    composerLessonId,
    discussionSubmittingKey,
    handleCreateDiscussionTopic,
    handleCreatePlatformReport,
    handleDeleteDiscussionReply,
    handleDeleteDiscussionTopic,
    handleModerateDiscussionReply,
    handleModerateDiscussionTopic,
    handleReplyDiscussionTopic,
    handleToggleDiscussionReaction,
    handleUpdateDiscussionReply,
    handleUpdateDiscussionTopic,
    replyDrafts,
    setComposerLessonId,
    setReplyDrafts,
    setTopicContent,
    setTopicTitle,
    topicContent,
    topicTitle,
  }
}
