import { useState } from 'react'
import EducationShell from '@/components/EducationShell'
import type { EducationDashboardContextValue } from '@/components/education-dashboard-context'
import { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import NotificationFilterBar from './NotificationFilterBar'
import NotificationListCard from './NotificationListCard'
import NotificationSettingsCard from './NotificationSettingsCard'
import {
  buildNotificationCourseMap,
  buildVisibleNotificationCategories,
  canShowNotification,
  filterNotifications,
  getVisibleCategories,
  type NotificationReadFilter,
} from '../functions/notificationPanelModel'

type NotificationWorkspaceProps = {
  dashboard: EducationDashboardResponse
  dashboardApi: EducationDashboardContextValue
}

export default function NotificationWorkspace({ dashboard, dashboardApi }: NotificationWorkspaceProps) {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('all')
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>('all')
  const [courseId, setCourseId] = useState('all')
  const courseMap = buildNotificationCourseMap(dashboard.courses)
  const visibleCategories = getVisibleCategories(dashboard.currentUser.role)
  const visibleNotifications = dashboard.notifications.filter((item) => canShowNotification(item.category, dashboard.currentUser.role))
  const categories = buildVisibleNotificationCategories(dashboard.currentUser.role, dashboard.notifications)
  const filteredNotifications = filterNotifications({
    notifications: dashboard.notifications,
    role: dashboard.currentUser.role,
    keyword,
    category,
    readFilter,
    courseId,
  })
  const unreadCount = visibleNotifications.filter((item) => !item.read).length

  return (
    <EducationShell
      eyebrow="消息中心"
      title="消息中心"
      description={dashboard.currentUser.role === UserRole.Student ? '集中查看课程消息、截止提醒、公告和讨论提及。' : '集中查看站内消息、截止提醒、审核提醒、批改提醒和系统公告。'}
      navCounts={{ '/notifications': unreadCount }}
    >
      <div className="space-y-6">
        <NotificationFilterBar
          unreadCount={unreadCount}
          keyword={keyword}
          category={category}
          readFilter={readFilter}
          courseId={courseId}
          categories={categories}
          courses={dashboard.courses}
          onKeywordChange={setKeyword}
          onCategoryChange={setCategory}
          onReadFilterChange={setReadFilter}
          onCourseIdChange={setCourseId}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <NotificationListCard
            notifications={filteredNotifications}
            courses={dashboard.courses}
            courseMap={courseMap}
            onMarkRead={(notificationId, read) => void dashboardApi.markNotificationRead(notificationId, read)}
          />
          <NotificationSettingsCard
            visibleCategories={visibleCategories}
            settings={dashboard.notificationSettings}
            onUpdateSetting={(settingCategory, enabled) => void dashboardApi.updateNotificationSetting(settingCategory, enabled)}
          />
        </div>
      </div>
    </EducationShell>
  )
}
