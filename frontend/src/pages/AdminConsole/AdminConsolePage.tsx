import { useParams } from 'react-router-dom'
import EducationPageGuard from '@/components/EducationPageGuard'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import AdminConsoleWorkspace, { type GovernanceView, type OrganizationView } from './components/AdminConsoleWorkspace'
import { sectionCopy, type AdminSection } from './objects/adminConsoleConfig'

export default function AdminConsole({
  section = 'overview',
  governanceView = 'overview',
  organizationView = 'overview',
}: {
  section?: AdminSection
  governanceView?: GovernanceView
  organizationView?: OrganizationView
}) {
  const routeParams = useParams()
  const dashboardApi = useEducationDashboard()

  return (
    <EducationPageGuard title={sectionCopy[section].title} description={sectionCopy[section].description}>
      {(dashboard) => (
        <AdminConsoleWorkspace
          section={section}
          governanceView={governanceView}
          organizationView={organizationView}
          dashboard={dashboard}
          dashboardApi={dashboardApi}
          routeParams={routeParams}
        />
      )}
    </EducationPageGuard>
  )
}
