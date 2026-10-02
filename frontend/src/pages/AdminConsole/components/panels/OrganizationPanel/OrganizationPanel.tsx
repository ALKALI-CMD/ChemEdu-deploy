import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { Course } from '@/objects/course/catalog/Course'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import type { NoticeState } from '@/components/ExperienceState'
import OrganizationPanelContent from './components/OrganizationPanelContent'
import { useAdminOrganizationPanelModel } from './hooks/useAdminOrganizationPanelModel'

type OrganizationView = 'overview' | 'enrollments' | 'waitlist' | 'structure' | 'students' | 'courses' | 'logs'

type AdminOrganizationPanelProps = {
  dashboard: EducationDashboardResponse
  view: OrganizationView
  busyKey: string | null
  setNotice: (notice: NoticeState) => void
  onSaveDepartment: (input: { departmentId?: string; name: string }) => Promise<Department>
  onSaveMajor: (input: { majorId?: string; departmentId: string; name: string }) => Promise<Major>
  onSaveAcademicClass: (input: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number }) => Promise<AcademicClass>
  onSaveSemester: (input: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean }) => Promise<SemesterTerm>
  onDeleteDepartment: (departmentId: string) => Promise<string>
  onDeleteMajor: (majorId: string) => Promise<string>
  onDeleteAcademicClass: (academicClassId: string) => Promise<string>
  onDeleteSemester: (semesterId: string) => Promise<string>
  onAssignStudents: (academicClassId: string, studentIds: string[]) => Promise<string>
  onClearStudentsClass: (studentIds: string[]) => Promise<string>
  onAssignCourseClasses: (courseId: Course['id'], academicClassIds: string[]) => Promise<Course>
  onReviewEnrollment: (courseId: Course['id'], userId: string, approved: boolean) => Promise<string>
  onPromoteWaitlistEntry: (courseId: Course['id'], userId: string) => Promise<string>
  onArchiveSemester: (semesterId: string, archiveCourses: boolean) => Promise<string>
}

export default function AdminOrganizationPanel({
  dashboard,
  view,
  busyKey,
  setNotice,
  onSaveDepartment,
  onSaveMajor,
  onSaveAcademicClass,
  onSaveSemester,
  onDeleteDepartment,
  onDeleteMajor,
  onDeleteAcademicClass,
  onDeleteSemester,
  onAssignStudents,
  onClearStudentsClass,
  onAssignCourseClasses,
  onReviewEnrollment,
  onPromoteWaitlistEntry,
  onArchiveSemester,
}: AdminOrganizationPanelProps) {
  const model = useAdminOrganizationPanelModel(dashboard, setNotice)

  return (
    <div className="space-y-6">
      <OrganizationPanelContent
        dashboard={dashboard}
        view={view}
        busyKey={busyKey}
        model={model}
        onSaveDepartment={onSaveDepartment}
        onSaveMajor={onSaveMajor}
        onSaveAcademicClass={onSaveAcademicClass}
        onSaveSemester={onSaveSemester}
        onDeleteDepartment={onDeleteDepartment}
        onDeleteMajor={onDeleteMajor}
        onDeleteAcademicClass={onDeleteAcademicClass}
        onDeleteSemester={onDeleteSemester}
        onAssignStudents={onAssignStudents}
        onClearStudentsClass={onClearStudentsClass}
        onAssignCourseClasses={onAssignCourseClasses}
        onReviewEnrollment={onReviewEnrollment}
        onPromoteWaitlistEntry={onPromoteWaitlistEntry}
        onArchiveSemester={onArchiveSemester}
      />
    </div>
  )
}
