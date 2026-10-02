import EducationPageGuard from '@/components/EducationPageGuard'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import NotificationWorkspace from './components/NotificationWorkspace'

export default function NotificationCenter() {
  const dashboardApi = useEducationDashboard()

  return (
    <EducationPageGuard title="消息中心" description="集中查看站内消息、截止提醒、公告以及通知设置。">
      {(dashboard) => <NotificationWorkspace dashboard={dashboard} dashboardApi={dashboardApi} />}
    </EducationPageGuard>
  )
}
