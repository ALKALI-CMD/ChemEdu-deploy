import type { Course } from '@/objects/course/catalog/Course'
import TeacherCourseCard from './TeacherCourseCard'

export default function TeacherCourseList({
  courses,
  selectedCourseId,
  selectedCourseIds,
  canManage,
  onSelectCourse,
  onToggleStatus,
  onToggleCourseSelection,
  statusLabel,
  auditLabel,
}: {
  courses: Course[]
  selectedCourseId?: string | null
  selectedCourseIds: string[]
  canManage: boolean
  onSelectCourse: (courseId: string) => void
  onToggleStatus: (course: Course) => Promise<void>
  onToggleCourseSelection: (courseId: string) => void
  statusLabel: Record<Course['status'], string>
  auditLabel: Record<Course['auditStatus'], string>
}) {
  return (
    <>
      {courses.map((course) => (
        <TeacherCourseCard
          key={course.id}
          course={course}
          checked={selectedCourseIds.includes(course.id)}
          canManage={canManage}
          selectedCourseId={selectedCourseId}
          onToggleCourseSelection={onToggleCourseSelection}
          onSelectCourse={onSelectCourse}
          onToggleStatus={onToggleStatus}
          statusLabel={statusLabel}
          auditLabel={auditLabel}
        />
      ))}
    </>
  )
}
