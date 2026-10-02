import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import EducationShell from '@/components/EducationShell'
import { useAuth } from '@/components/auth-context'
import { consumeManualLogoutFlag } from '@/components/auth-session'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { EducationPageSkeleton } from '@/components/education/VisualStates'
import { ErrorStateCard } from '@/components/ExperienceState'

type DashboardData = NonNullable<ReturnType<typeof useEducationDashboard>['dashboard']>

type EducationPageGuardProps = {
  title: string
  description: string
  loadingVariant?: 'courses' | 'student' | 'teacher'
  children: (dashboard: DashboardData) => ReactNode
}

export default function EducationPageGuard({ title, description, loadingVariant = 'student', children }: EducationPageGuardProps) {
  const location = useLocation()
  const { session, clearSession } = useAuth()
  const { dashboard, loading, error, refresh } = useEducationDashboard()

  if (!session) {
    if (consumeManualLogoutFlag()) {
      return <Navigate replace to="/login" />
    }
    return <Navigate replace to="/login" state={{ from: location.pathname }} />
  }

  if (loading) {
    return (
      <EducationShell title={title} description={description}>
        <EducationPageSkeleton variant={loadingVariant} />
      </EducationShell>
    )
  }

  if (
    error?.includes('Invalid or expired session token') ||
    error?.includes('Invalid session token') ||
    error?.includes('Session has expired') ||
    error?.includes('登录态已失效')
  ) {
    clearSession('expired')
    return <Navigate replace to="/login" state={{ from: location.pathname, sessionExpired: true }} />
  }

  if (error || !dashboard) {
    return (
      <EducationShell title={title} description={description}>
        <ErrorStateCard
          title="页面数据加载失败"
          message={error ?? '当前没有可用的仪表盘数据，请稍后重试。'}
          actionLabel="重新加载"
          onAction={() => void refresh()}
        />
      </EducationShell>
    )
  }

  return <>{children(dashboard)}</>
}
