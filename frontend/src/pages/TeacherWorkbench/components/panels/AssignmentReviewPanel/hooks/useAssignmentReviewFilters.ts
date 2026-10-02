import { useMemo, useState } from 'react'
import type { Assignment } from '@/objects/course/learning/Assignment'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'

type ReviewFilter = 'all' | 'submitted' | 'reviewed'

function useAssignmentReviewFilters(assignments: Assignment[]) {
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<ReviewFilter>('all')

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      if (courseFilter !== 'all' && assignment.courseId !== courseFilter) return false
      if (statusFilter === 'submitted' && assignment.submissionStatus !== SubmissionStatus.Submitted) return false
      if (statusFilter === 'reviewed' && assignment.submissionStatus !== SubmissionStatus.Reviewed) return false
      return true
    })
  }, [assignments, courseFilter, statusFilter])

  return {
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    filteredAssignments,
  }
}

export { useAssignmentReviewFilters }
export type { ReviewFilter }
