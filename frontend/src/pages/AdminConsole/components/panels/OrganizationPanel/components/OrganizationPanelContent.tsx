import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { Course } from '@/objects/course/catalog/Course'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import type { useAdminOrganizationPanelModel } from '../hooks/useAdminOrganizationPanelModel'
import CourseClassAssignmentPanel from './CourseClassAssignmentPanel'
import CourseTeachingOrganizationPanel from './CourseTeachingOrganizationPanel'
import EnrollmentReviewPanel from './EnrollmentReviewPanel'
import OrganizationChangeLogPanel from './OrganizationChangeLogPanel'
import OrganizationOverviewPanel from './OrganizationOverviewPanel'
import OrganizationStructureManagementPanel from './OrganizationStructureManagementPanel'
import SemesterArchivePanel from './SemesterArchivePanel'
import StudentClassAssignmentPanel from './StudentClassAssignmentPanel'
import WaitlistPromotionPanel from './WaitlistPromotionPanel'

type OrganizationView = 'overview' | 'enrollments' | 'waitlist' | 'structure' | 'students' | 'courses' | 'logs'

type OrganizationPanelContentProps = {
  dashboard: EducationDashboardResponse
  view: OrganizationView
  busyKey: string | null
  model: ReturnType<typeof useAdminOrganizationPanelModel>
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

export default function OrganizationPanelContent(props: OrganizationPanelContentProps) {
  const {
    dashboard,
    view,
    busyKey,
    model,
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
  } = props

  if (view === 'overview') {
    return (
      <OrganizationOverviewPanel
        departmentCount={dashboard.departments.length}
        majorCount={dashboard.majors.length}
        academicClassCount={dashboard.academicClasses.length}
        semesterCount={dashboard.semesters.length}
        pendingEnrollmentCount={model.pendingEnrollments.length}
        waitlistCount={dashboard.waitlistEntries.length}
        studentCount={model.studentUsers.length}
        courseCount={dashboard.courses.length}
        logCount={dashboard.organizationChangeLogs.length}
      />
    )
  }

  if (view === 'enrollments') {
    return (
      <EnrollmentReviewPanel
        enrollments={model.pendingEnrollments}
        courseMap={model.courseMap}
        userMap={model.userMap}
        busyKey={busyKey}
        onReviewEnrollment={(courseId, userId, approved) =>
          void model.handleMessageAction(approved ? '报名已通过' : '报名已驳回', () => onReviewEnrollment(courseId, userId, approved))
        }
      />
    )
  }

  if (view === 'structure') {
    return (
      <>
        <SemesterArchivePanel
          semesters={dashboard.semesters}
          courses={dashboard.courses}
          busyKey={busyKey}
          onArchiveSemester={(semesterId) => void model.handleMessageAction('学期已归档', () => onArchiveSemester(semesterId, true))}
        />
        <OrganizationStructureManagementPanel
          dashboard={dashboard}
          busyKey={busyKey}
          majorMap={model.majorMap}
          departmentMap={model.departmentMap}
          handleSave={model.handleSave}
          handleDelete={model.handleDelete}
          onSaveDepartment={onSaveDepartment}
          onSaveMajor={onSaveMajor}
          onSaveAcademicClass={onSaveAcademicClass}
          onSaveSemester={onSaveSemester}
          onDeleteDepartment={onDeleteDepartment}
          onDeleteMajor={onDeleteMajor}
          onDeleteAcademicClass={onDeleteAcademicClass}
          onDeleteSemester={onDeleteSemester}
        />
      </>
    )
  }

  if (view === 'waitlist') {
    return (
      <WaitlistPromotionPanel
        waitlistEntries={dashboard.waitlistEntries}
        courseMap={model.courseMap}
        userMap={model.userMap}
        busyKey={busyKey}
        onPromoteWaitlistEntry={(courseId, userId) =>
          void model.handleMessageAction('候补已转正', () => onPromoteWaitlistEntry(courseId, userId))
        }
      />
    )
  }

  if (view === 'students') {
    return (
      <StudentClassAssignmentPanel
        dashboard={dashboard}
        busyKey={busyKey}
        handleSave={model.handleSave}
        onAssignStudents={onAssignStudents}
        onClearStudentsClass={onClearStudentsClass}
      />
    )
  }

  if (view === 'courses') {
    return (
      <>
        <CourseClassAssignmentPanel
          dashboard={dashboard}
          busyKey={busyKey}
          majorMap={model.majorMap}
          handleSave={model.handleSave}
          onAssignCourseClasses={onAssignCourseClasses}
        />
        <CourseTeachingOrganizationPanel
          courses={dashboard.courses}
          classMap={model.classMap}
          majorMap={model.majorMap}
          departmentMap={model.departmentMap}
        />
      </>
    )
  }

  if (view === 'logs') return <OrganizationChangeLogPanel logs={dashboard.organizationChangeLogs} />

  return null
}
