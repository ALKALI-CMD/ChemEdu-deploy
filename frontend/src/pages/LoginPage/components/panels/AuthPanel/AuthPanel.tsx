import { Navigate } from 'react-router-dom'
import { isBannedSession } from '@/components/auth-permissions'
import { PageStateCard } from '@/components/ExperienceState'
import AuthFormCard from './components/AuthFormCard'
import AuthHero from './components/AuthHero'
import { useAuthPanelState } from './hooks/useAuthPanelState'
import { getRoleHome } from './functions/authPanelModel'

export default function LoginPage() {
  const auth = useAuthPanelState()

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <PageStateCard tone="info" title="正在恢复登录状态" message="本地会话校验完成后，我们会自动跳转到合适的页面。" />
        </div>
      </div>
    )
  }

  if (isBannedSession(auth.session)) {
    return <Navigate replace to="/banned" />
  }

  if (auth.session?.user?.role) {
    return <Navigate replace to={getRoleHome(auth.session.user.role)} />
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-slate-950 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
        <AuthHero />
        <AuthFormCard
          mode={auth.mode}
          submitting={auth.submitting}
          notice={auth.notice}
          fieldErrors={auth.fieldErrors}
          email={auth.email}
          password={auth.password}
          confirmPassword={auth.confirmPassword}
          name={auth.name}
          role={auth.role}
          grade={auth.grade}
          subject={auth.subject}
          bio={auth.bio}
          onToggleMode={auth.handleToggleMode}
          onSubmit={auth.handleSubmit}
          onEmailChange={auth.setEmail}
          onPasswordChange={auth.setPassword}
          onConfirmPasswordChange={auth.setConfirmPassword}
          onNameChange={auth.setName}
          onRoleChange={auth.setRole}
          onGradeChange={auth.setGrade}
          onSubjectChange={auth.setSubject}
          onBioChange={auth.setBio}
        />
      </div>
    </div>
  )
}
