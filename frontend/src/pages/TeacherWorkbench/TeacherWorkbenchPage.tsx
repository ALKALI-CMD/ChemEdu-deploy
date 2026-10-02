import EducationPageGuard from '@/components/EducationPageGuard'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { useParams } from 'react-router-dom'
import TeacherWorkbenchWorkspace from './components/TeacherWorkbenchWorkspace'
import { sectionCopy, type TeacherWorkbenchSection } from './objects/teacherWorkbenchConfig'

export default function TeacherWorkbench({ section = 'overview' }: { section?: TeacherWorkbenchSection }) {
  const dashboardApi = useEducationDashboard()
  const routeParams = useParams()

  return (
    <EducationPageGuard title={sectionCopy[section].title} description={sectionCopy[section].description} loadingVariant="teacher">
      {(dashboard) => (
        <TeacherWorkbenchWorkspace
          section={section}
          dashboard={dashboard}
          dashboardApi={dashboardApi}
          routeParams={routeParams}
        />
      )}
    </EducationPageGuard>
  )
}
