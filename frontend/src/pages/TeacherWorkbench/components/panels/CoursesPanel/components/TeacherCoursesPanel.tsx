import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/UiComponents'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { Course } from '@/objects/course/catalog/Course'
import TeacherCoursesBatchActions from './TeacherCoursesBatchActions'
import TeacherCourseList from './TeacherCourseList'
import TeacherCoursesEmptyState from './TeacherCoursesEmptyState'
import TeacherCoursesHeader from './TeacherCoursesHeader'
import { useTeacherCourseFilters } from '../hooks/useTeacherCourseFilters'
import type { CourseFilter } from '../functions/teacherCourseUtils'

type TeacherCoursesPanelProps = {
  courses: Course[]
  canManage: boolean
  selectedCourseId?: string | null
  selectedCourseIds: string[]
  onSelectCourse: (courseId: string) => void
  onToggleStatus: (course: Course) => Promise<void>
  onToggleCourseSelection: (courseId: string) => void
  onSelectAllFiltered: (courseIds: string[]) => void
  onClearSelection: () => void
  onBatchStatusChange: (courseIds: string[], nextStatus: CourseStatus) => Promise<void>
}

const statusLabel: Record<CourseStatus, string> = {
  [CourseStatus.Published]: '已发布',
  [CourseStatus.Draft]: '草稿',
  [CourseStatus.Archived]: '已下架',
}

const auditLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '已通过',
  [CourseAuditStatus.Rejected]: '已驳回',
}

const filterLabel: Record<CourseFilter, string> = {
  all: '全部课程',
  draft: '草稿',
  pending: '待审核',
  published: '已发布',
  archived: '已下架',
}

export default function TeacherCoursesPanel({
  courses,
  canManage,
  selectedCourseId,
  selectedCourseIds,
  onSelectCourse,
  onToggleStatus,
  onToggleCourseSelection,
  onSelectAllFiltered,
  onClearSelection,
  onBatchStatusChange,
}: TeacherCoursesPanelProps) {
  const [batchUpdating, setBatchUpdating] = useState(false)
  const {
    filter,
    setFilter,
    keyword,
    setKeyword,
    filterCounts,
    filteredCourses,
    filteredCourseIds,
    selectedInFiltered,
    allFilteredSelected,
  } = useTeacherCourseFilters(courses, selectedCourseIds)

  async function handleBatchStatusChange(nextStatus: CourseStatus) {
    if (selectedInFiltered.length === 0) return
    setBatchUpdating(true)
    try {
      await onBatchStatusChange(selectedInFiltered, nextStatus)
    } finally {
      setBatchUpdating(false)
    }
  }

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <TeacherCoursesHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        filter={filter}
        onFilterChange={setFilter}
        filterLabel={filterLabel}
        filterCounts={filterCounts}
      />

      <CardContent className="space-y-4">
        <TeacherCoursesBatchActions
          selectedCourseIdsCount={selectedCourseIds.length}
          selectedInFilteredCount={selectedInFiltered.length}
          allFilteredSelected={allFilteredSelected}
          filteredCourseIds={filteredCourseIds}
          canManage={canManage}
          batchUpdating={batchUpdating}
          onToggleSelectAll={() => (allFilteredSelected ? onClearSelection() : onSelectAllFiltered(filteredCourseIds))}
          onBatchStatusChange={(nextStatus) => void handleBatchStatusChange(nextStatus)}
        />

        {filteredCourses.length === 0 ? <TeacherCoursesEmptyState /> : null}

        <TeacherCourseList
          courses={filteredCourses}
          selectedCourseId={selectedCourseId}
          selectedCourseIds={selectedCourseIds}
          canManage={canManage}
          onSelectCourse={onSelectCourse}
          onToggleStatus={onToggleStatus}
          onToggleCourseSelection={onToggleCourseSelection}
          statusLabel={statusLabel}
          auditLabel={auditLabel}
        />
      </CardContent>
    </Card>
  )
}
