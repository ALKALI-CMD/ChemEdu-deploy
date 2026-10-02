import { useMemo } from 'react'
import type { NoticeState } from '@/components/ExperienceState'
import { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

export function useAdminOrganizationPanelModel(
  dashboard: EducationDashboardResponse,
  setNotice: (notice: NoticeState) => void,
) {
  const classMap = useMemo(() => new Map(dashboard.academicClasses.map((item) => [item.id, item])), [dashboard.academicClasses])
  const majorMap = useMemo(() => new Map(dashboard.majors.map((item) => [item.id, item])), [dashboard.majors])
  const departmentMap = useMemo(() => new Map(dashboard.departments.map((item) => [item.id, item])), [dashboard.departments])
  const studentUsers = useMemo(() => dashboard.users.filter((user) => user.role === UserRole.Student), [dashboard.users])
  const userMap = useMemo(() => new Map(dashboard.users.map((user) => [String(user.id), user])), [dashboard.users])
  const courseMap = useMemo(() => new Map(dashboard.courses.map((course) => [String(course.id), course])), [dashboard.courses])
  const pendingEnrollments = useMemo(() => dashboard.enrollments.filter((enrollment) => enrollment.status === 'pending'), [dashboard.enrollments])

  async function handleSave<T>(runner: () => Promise<T>, successTitle: string, successMessage: string, reset?: () => void) {
    try {
      await runner()
      reset?.()
      setNotice({ tone: 'success', title: successTitle, message: successMessage })
    } catch (error) {
      setNotice({ tone: 'error', title: `${successTitle}失败`, message: error instanceof Error ? error.message : '操作失败。' })
    }
  }

  async function handleDelete(label: string, runner: () => Promise<string>) {
    const confirmed = window.confirm(`确定删除${label}吗？`)
    if (!confirmed) return
    try {
      const message = await runner()
      setNotice({ tone: 'success', title: '删除成功', message })
    } catch (error) {
      setNotice({ tone: 'error', title: '删除失败', message: error instanceof Error ? error.message : '操作失败。' })
    }
  }

  async function handleMessageAction(successTitle: string, runner: () => Promise<string>) {
    try {
      const message = await runner()
      setNotice({ tone: 'success', title: successTitle, message })
    } catch (error) {
      setNotice({ tone: 'error', title: `${successTitle}失败`, message: error instanceof Error ? error.message : '操作失败。' })
    }
  }

  return {
    classMap,
    majorMap,
    departmentMap,
    studentUsers,
    userMap,
    courseMap,
    pendingEnrollments,
    handleSave,
    handleDelete,
    handleMessageAction,
  }
}
