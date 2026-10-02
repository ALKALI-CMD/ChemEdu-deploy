import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { UserId } from '@/objects/auth/UserId'
import type { Course } from '@/objects/course/catalog/Course'

type UseAdminOrganizationHandlersParams = {
  setBusyKey: (key: string | null) => void
  saveDepartment: (input: { departmentId?: string; name: string }) => Promise<Department>
  saveMajor: (input: { majorId?: string; departmentId: string; name: string }) => Promise<Major>
  saveAcademicClass: (input: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number }) => Promise<AcademicClass>
  saveSemester: (input: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean }) => Promise<SemesterTerm>
  deleteDepartment: (departmentId: string) => Promise<string>
  deleteMajor: (majorId: string) => Promise<string>
  deleteAcademicClass: (academicClassId: string) => Promise<string>
  deleteSemester: (semesterId: string) => Promise<string>
  assignStudentsToAcademicClass: (academicClassId: string, studentIds: string[]) => Promise<string>
  clearStudentsAcademicClass: (studentIds: string[]) => Promise<string>
  updateCourseAcademicClasses: (courseId: Course['id'], academicClassIds: string[]) => Promise<Course>
  reviewEnrollment: (courseId: Course['id'], userId: UserId, approved: boolean) => Promise<string>
  promoteWaitlistEntry: (courseId: Course['id'], userId: UserId) => Promise<string>
  archiveSemester: (semesterId: string, archiveCourses: boolean) => Promise<string>
}

async function withBusyKey<T>(setBusyKey: (key: string | null) => void, key: string, runner: () => Promise<T>) {
  setBusyKey(key)
  try {
    return await runner()
  } finally {
    setBusyKey(null)
  }
}

export function useAdminOrganizationHandlers({
  setBusyKey,
  saveDepartment,
  saveMajor,
  saveAcademicClass,
  saveSemester,
  deleteDepartment,
  deleteMajor,
  deleteAcademicClass,
  deleteSemester,
  assignStudentsToAcademicClass,
  clearStudentsAcademicClass,
  updateCourseAcademicClasses,
  reviewEnrollment,
  promoteWaitlistEntry,
  archiveSemester,
}: UseAdminOrganizationHandlersParams) {
  return {
    onSaveDepartment: (input: { departmentId?: string; name: string }) =>
      withBusyKey(setBusyKey, 'org:department', () => saveDepartment(input)),
    onSaveMajor: (input: { majorId?: string; departmentId: string; name: string }) =>
      withBusyKey(setBusyKey, 'org:major', () => saveMajor(input)),
    onSaveAcademicClass: (input: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number }) =>
      withBusyKey(setBusyKey, 'org:class', () => saveAcademicClass(input)),
    onSaveSemester: (input: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean }) =>
      withBusyKey(setBusyKey, 'org:semester', () => saveSemester(input)),
    onDeleteDepartment: (departmentId: string) =>
      withBusyKey(setBusyKey, 'org:department-delete', () => deleteDepartment(departmentId)),
    onDeleteMajor: (majorId: string) =>
      withBusyKey(setBusyKey, 'org:major-delete', () => deleteMajor(majorId)),
    onDeleteAcademicClass: (academicClassId: string) =>
      withBusyKey(setBusyKey, 'org:class-delete', () => deleteAcademicClass(academicClassId)),
    onDeleteSemester: (semesterId: string) =>
      withBusyKey(setBusyKey, 'org:semester-delete', () => deleteSemester(semesterId)),
    onAssignStudents: (academicClassId: string, studentIds: string[]) =>
      withBusyKey(setBusyKey, 'org:student-assignment', () => assignStudentsToAcademicClass(academicClassId, studentIds)),
    onClearStudentsClass: (studentIds: string[]) =>
      withBusyKey(setBusyKey, 'org:student-clear', () => clearStudentsAcademicClass(studentIds)),
    onAssignCourseClasses: (courseId: Course['id'], academicClassIds: string[]) =>
      withBusyKey(setBusyKey, 'org:course-assignment', () => updateCourseAcademicClasses(courseId, academicClassIds)),
    onReviewEnrollment: (courseId: Course['id'], userId: string, approved: boolean) =>
      withBusyKey(setBusyKey, `org:enrollment:${courseId}:${userId}`, () => reviewEnrollment(courseId, userId as UserId, approved)),
    onPromoteWaitlistEntry: (courseId: Course['id'], userId: string) =>
      withBusyKey(setBusyKey, `org:waitlist:${courseId}:${userId}`, () => promoteWaitlistEntry(courseId, userId as UserId)),
    onArchiveSemester: (semesterId: string, archiveCourses: boolean) =>
      withBusyKey(setBusyKey, `org:semester-archive:${semesterId}`, () => archiveSemester(semesterId, archiveCourses)),
  }
}
