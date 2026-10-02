import { UserRole } from '@/objects/auth/UserRole'
import type { Course } from '@/objects/course/catalog/Course'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'

export const categoryLabel: Record<string, string> = {
  message: '站内消息',
  deadline: '截止提醒',
  audit: '审核提醒',
  grading: '批改提醒',
  announcement: '系统公告',
  mention: '提及提醒',
  system: '系统通知',
}

const studentCategories = ['all', 'message', 'deadline', 'announcement', 'mention', 'system']
const staffCategories = ['all', 'message', 'deadline', 'audit', 'grading', 'announcement', 'mention', 'system']

export type NotificationReadFilter = 'all' | 'unread' | 'read'
export type NotificationItem = EducationDashboardResponse['notifications'][number]

export function getVisibleCategories(role: UserRole | string) {
  return Array.from(new Set(role === UserRole.Student ? studentCategories : staffCategories))
}

export function canShowNotification(category: string, role: UserRole | string) {
  return getVisibleCategories(role).includes(category)
}

export function filterNotifications({
  notifications,
  role,
  keyword,
  category,
  readFilter,
  courseId,
}: {
  notifications: NotificationItem[]
  role: UserRole | string
  keyword: string
  category: string
  readFilter: NotificationReadFilter
  courseId: string
}) {
  return notifications
    .filter((item) => canShowNotification(item.category, role))
    .filter((item) => {
      const haystack = `${item.title} ${item.content} ${categoryLabel[item.category] ?? item.category}`.toLowerCase()
      if (keyword.trim() && !haystack.includes(keyword.trim().toLowerCase())) return false
      if (category !== 'all' && item.category !== category) return false
      if (readFilter === 'read' && !item.read) return false
      if (readFilter === 'unread' && item.read) return false
      if (courseId !== 'all' && item.courseId !== courseId) return false
      return true
    })
}

export function buildNotificationCourseMap(courses: Course[]) {
  return new Map(courses.map((course) => [String(course.id), String(course.title)]))
}

export function buildVisibleNotificationCategories(role: UserRole | string, notifications: NotificationItem[]) {
  const visibleCategories = getVisibleCategories(role)
  const visibleNotifications = notifications.filter((item) => canShowNotification(item.category, role))
  return visibleCategories.filter((item) => item === 'all' || visibleNotifications.some((notice) => notice.category === item))
}

export function buildCourseReadSummary(item: NotificationItem, courses: Course[]) {
  if (item.category !== 'message' || !item.courseId) return null

  const course = courses.find((entry) => entry.id === item.courseId)
  return {
    expectedCount: course?.enrolledCount ?? 0,
    currentState: item.read ? '你已查看' : '你未查看',
  }
}
