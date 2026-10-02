import { useMemo, useState } from 'react'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import type { Course } from '@/objects/course/catalog/Course'

type AuditFilter = 'all' | 'pending' | 'approved' | 'rejected'

function useCourseAuditFilters(courses: Course[]) {
  const [filter, setFilter] = useState<AuditFilter>('all')

  const filterCounts = useMemo(
    () => ({
      all: courses.length,
      pending: courses.filter((course) => course.auditStatus === CourseAuditStatus.Pending).length,
      approved: courses.filter((course) => course.auditStatus === CourseAuditStatus.Approved).length,
      rejected: courses.filter((course) => course.auditStatus === CourseAuditStatus.Rejected).length,
    }),
    [courses],
  )

  const filteredCourses = useMemo(() => {
    if (filter === 'all') return courses
    return courses.filter((course) => course.auditStatus === filter)
  }, [courses, filter])

  return { filter, setFilter, filterCounts, filteredCourses }
}

export { useCourseAuditFilters }
export type { AuditFilter }
