import type { UserRole } from '@/objects/auth/UserRole'
import type { Course } from '@/objects/course/catalog/Course'
import CourseCard from './CourseCard'

type CourseResultsProps = {
  courses: Course[]
  currentRole: UserRole
  enrolledCourseIds: Set<string>
  teacherNameMap: Map<string, string>
  pendingCourseId: string | null
  onEnroll: (course: Course) => Promise<void>
}

export default function CourseResults({
  courses,
  currentRole,
  enrolledCourseIds,
  teacherNameMap,
  pendingCourseId,
  onEnroll,
}: CourseResultsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {courses.map((course) => {
        const courseId = String(course.id)
        return (
          <CourseCard
            key={courseId}
            course={course}
            currentRole={currentRole}
            enrolled={enrolledCourseIds.has(courseId)}
            teacherName={teacherNameMap.get(String(course.teacherId)) ?? '未分配教师'}
            pending={pendingCourseId === courseId}
            onEnroll={onEnroll}
          />
        )
      })}
    </div>
  )
}
