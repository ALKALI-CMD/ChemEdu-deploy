import { useMemo, useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import { buildFilterCounts, matchesFilter, type CourseFilter } from '../functions/teacherCourseUtils'

function useTeacherCourseFilters(courses: Course[], selectedCourseIds: string[]) {
  const [filter, setFilter] = useState<CourseFilter>('all')
  const [keyword, setKeyword] = useState('')

  const filterCounts = useMemo(() => buildFilterCounts(courses), [courses])

  const filteredCourses = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return courses.filter((course) => {
      if (!matchesFilter(course, filter)) return false
      if (!normalizedKeyword) return true

      const searchable = `${course.title} ${course.subtitle} ${course.category} ${course.schedule}`.toLowerCase()
      return searchable.includes(normalizedKeyword)
    })
  }, [courses, filter, keyword])

  const filteredCourseIds = filteredCourses.map((course) => course.id)
  const selectedInFiltered = filteredCourseIds.filter((courseId) => selectedCourseIds.includes(courseId))
  const allFilteredSelected = filteredCourseIds.length > 0 && selectedInFiltered.length === filteredCourseIds.length

  return {
    filter,
    setFilter,
    keyword,
    setKeyword,
    filterCounts,
    filteredCourses,
    filteredCourseIds,
    selectedInFiltered,
    allFilteredSelected,
  }
}

export { useTeacherCourseFilters }
