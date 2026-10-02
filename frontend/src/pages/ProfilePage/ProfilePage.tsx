import EducationPageGuard from '@/components/EducationPageGuard'
import EducationShell from '@/components/EducationShell'
import ProfilePanel from './components/panels/ProfilePanel/ProfilePanel'

export default function ProfilePage() {
  return (
    <EducationPageGuard title="个人资料" description="账号设置。">
      {(dashboard) => (
        <EducationShell title="个人资料" description="账号设置。">
          <ProfilePanel dashboard={dashboard} />
        </EducationShell>
      )}
    </EducationPageGuard>
  )
}
