import type { Course } from '@/objects/course/catalog/Course'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'

type CourseFilter = 'all' | 'draft' | 'pending' | 'published' | 'archived'

function matchesFilter(course: Course, filter: CourseFilter) {
  switch (filter) {
    case 'draft':
      return course.status === CourseStatus.Draft
    case 'pending':
      return course.auditStatus === CourseAuditStatus.Pending
    case 'published':
      return course.status === CourseStatus.Published
    case 'archived':
      return course.status === CourseStatus.Archived
    default:
      return true
  }
}

function buildFilterCounts(courses: Course[]) {
  return {
    all: courses.length,
    draft: courses.filter((course) => course.status === CourseStatus.Draft).length,
    pending: courses.filter((course) => course.auditStatus === CourseAuditStatus.Pending).length,
    published: courses.filter((course) => course.status === CourseStatus.Published).length,
    archived: courses.filter((course) => course.status === CourseStatus.Archived).length,
  }
}

export { buildFilterCounts, matchesFilter }
export type { CourseFilter }
