import { useState } from 'react'
import { UserRole } from '@/objects/auth/UserRole'
import type { UserId } from '@/objects/auth/UserId'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { NoticeState } from '@/components/ExperienceState'
import type { OperationLogItem } from '../objects/adminConsoleConfig'
import { getErrorMessage, roleLabel, auditLabel, statusLabel } from '../objects/adminConsoleConfig'

function parsePermissions(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function useAdminConsoleActions({
  currentActor,
  courses,
  discussions,
  users,
  auditCourse,
  updateCourseStatus,
  deleteCourse,
  updateUserAccess,
  moderateDiscussionTopic,
}: {
  currentActor: string
  courses: Array<{ id: string; title: string; status: CourseStatus; enrolledCount: number }>
  discussions: Array<{ id: string; title: string; resolved?: boolean }>
  users: Array<{ id: UserId; name: string; permissions?: string[] }>
  auditCourse: (courseId: string, auditStatus: CourseAuditStatus, comment: string) => Promise<unknown>
  updateCourseStatus: (courseId: string, status: CourseStatus) => Promise<unknown>
  deleteCourse: (courseId: string) => Promise<string>
  updateUserAccess: (userId: UserId, role: UserRole, permissions: string[]) => Promise<unknown>
  moderateDiscussionTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: boolean,
  ) => Promise<unknown>
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState>(null)
  const [operationLogs, setOperationLogs] = useState<OperationLogItem[]>([])

  function appendOperationLog(action: string, target: string, detail?: string) {
    setOperationLogs((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        actor: currentActor,
        action,
        target,
        detail,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
      ...current,
    ])
  }

  async function handleUpdateUserAccess(userId: UserId, fallbackRole: UserRole, roleDrafts: Record<string, UserRole>, permissionDrafts: Record<string, string>) {
    const user = users.find((item) => item.id === userId)
    const role = roleDrafts[userId] ?? fallbackRole
    const permissions = parsePermissions(permissionDrafts[userId] ?? '')

    const confirmed = window.confirm(`确定要把用户“${user?.name ?? userId}”调整为“${roleLabel[role]}”并保存权限配置吗？`)
    if (!confirmed) return

    setBusyKey(`user:${userId}`)
    setNotice(null)
    try {
      await updateUserAccess(userId, role, permissions)
      appendOperationLog('权限修改', `用户：${user?.name ?? userId}`, `角色设为 ${roleLabel[role]}`)
      setNotice({ tone: 'success', title: '权限更新成功', message: '用户角色和权限已经更新。' })
    } catch (error) {
      setNotice({ tone: 'error', title: '权限更新失败', message: getErrorMessage(error) })
    } finally {
      setBusyKey(null)
    }
  }

  async function handleAuditCourse(courseId: string, auditStatus: CourseAuditStatus, auditCommentDrafts: Record<string, string>) {
    const course = courses.find((item) => item.id === courseId)
    const auditComment = (auditCommentDrafts[courseId] ?? '').trim()
    if (!auditComment) {
      setNotice({ tone: 'error', title: '审核未提交', message: '请先填写审核意见。' })
      return
    }

    setBusyKey(`course:${courseId}`)
    setNotice(null)
    try {
      await auditCourse(courseId, auditStatus, (auditComment).trim())
      appendOperationLog('课程审核', `课程：${course?.title ?? courseId}`, `结果：${auditLabel[auditStatus]}`)
      setNotice({ tone: 'success', title: '课程审核成功', message: '课程审核结果已经保存，状态面板会同步刷新。' })
    } catch (error) {
      setNotice({ tone: 'error', title: '课程审核失败', message: getErrorMessage(error) })
    } finally {
      setBusyKey(null)
    }
  }

  async function handleToggleCourseStatus(courseId: string, status: CourseStatus) {
    const course = courses.find((item) => item.id === courseId)
    setBusyKey(`status:${courseId}`)
    setNotice(null)
    try {
      await updateCourseStatus(courseId, status)
      appendOperationLog('课程状态更新', `课程：${course?.title ?? courseId}`, `状态改为 ${statusLabel[status]}`)
      setNotice({ tone: 'success', title: '课程状态已更新', message: '课程发布状态已经同步修改。' })
    } catch (error) {
      setNotice({ tone: 'error', title: '课程状态更新失败', message: getErrorMessage(error) })
    } finally {
      setBusyKey(null)
    }
  }

  async function handleDeleteCourse(courseId: string) {
    const course = courses.find((item) => item.id === courseId)
    if (!course) return
    const confirmed = window.confirm(`确定删除课程“${course.title}”吗？此操作会清理该课程的章节、作业、测验和讨论记录。`)
    if (!confirmed) return

    setBusyKey(`delete:${courseId}`)
    setNotice(null)
    try {
      const message = await deleteCourse(courseId)
      appendOperationLog('课程删除', `课程：${course.title}`)
      setNotice({ tone: 'success', title: '课程已删除', message })
    } catch (error) {
      setNotice({ tone: 'error', title: '课程删除失败', message: getErrorMessage(error) })
    } finally {
      setBusyKey(null)
    }
  }

  async function handleModerateTopic(
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) {
    const topic = discussions.find((item) => item.id === topicId)
    setBusyKey(`discussion:${topicId}`)
    setNotice(null)
    try {
      await moderateDiscussionTopic(topicId, visibility, threadState, pinState, topic?.resolved ?? false)
      appendOperationLog(
        '内容治理',
        `讨论：${topic?.title ?? topicId}`,
        `可见性 ${visibility} / 线程状态 ${threadState} / 置顶状态 ${pinState} / 已解决 ${topic?.resolved ?? false}`,
      )
      setNotice({ tone: 'success', title: '内容治理已更新', message: '讨论内容状态已经同步修改。' })
    } catch (error) {
      setNotice({ tone: 'error', title: '内容治理失败', message: getErrorMessage(error) })
    } finally {
      setBusyKey(null)
    }
  }

  return {
    busyKey,
    setBusyKey,
    notice,
    setNotice,
    operationLogs,
    handleUpdateUserAccess,
    handleAuditCourse,
    handleToggleCourseStatus,
    handleDeleteCourse,
    handleModerateTopic,
  }
}

export { useAdminConsoleActions }
