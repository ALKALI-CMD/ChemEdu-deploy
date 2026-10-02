import { Navigate, useLocation } from 'react-router-dom'
import { UserRole } from '@/objects/auth/UserRole'
import { useAuth } from '@/components/auth-context'
import { isBannedUser } from '@/components/auth-permissions'
import { LoadingStateCard } from '@/components/ExperienceState'
import { consumeManualLogoutFlag } from '@/components/auth-session'

export default function RoleGuard({
  allow,
  children,
}: {
  allow: UserRole[]
  children: React.ReactNode
}) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f7fbf7_0%,#edf7f2_42%,#f8f1e8_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <LoadingStateCard
            title="正在恢复登录状态"
            message="本地登录态校验完成后，我们会自动跳转到对应页面。"
          />
        </div>
      </div>
    )
  }

  if (!session || !session.user) {
    if (consumeManualLogoutFlag()) {
      return <Navigate replace to="/login" />
    }
    return <Navigate replace to="/login" state={{ from: location.pathname }} />
  }

  const currentRole = session.user.role

  if (isBannedUser(session.user)) {
    return <Navigate replace to="/banned" />
  }

  if (!allow.includes(currentRole)) {
    const fallback =
      currentRole === UserRole.Admin
        ? '/admin'
        : currentRole === UserRole.Analyst
          ? '/analyst'
          : '/discover'
    return <Navigate replace to={fallback} />
  }

  return <>{children}</>
}
