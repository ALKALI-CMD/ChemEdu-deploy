import { useState } from 'react'
import type { Major } from '@/objects/admin/Major'
import type { Course } from '@/objects/course/catalog/Course'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import {
  OrganizationEditorCard as EditorCard,
  OrganizationField as Field,
  OrganizationListCard as ListCard,
} from './OrganizationSharedComponents'

type CourseClassAssignmentPanelProps = {
  dashboard: EducationDashboardResponse
  busyKey: string | null
  majorMap: Map<string, Major>
  handleSave: <T>(runner: () => Promise<T>, successTitle: string, successMessage: string, reset?: () => void) => Promise<void>
  onAssignCourseClasses: (courseId: Course['id'], academicClassIds: string[]) => Promise<Course>
}

export default function CourseClassAssignmentPanel({
  dashboard,
  busyKey,
  majorMap,
  handleSave,
  onAssignCourseClasses,
}: CourseClassAssignmentPanelProps) {
  const [courseAssignmentId, setCourseAssignmentId] = useState<string>(String(dashboard.courses[0]?.id ?? ''))
  const [selectedCourseClassIds, setSelectedCourseClassIds] = useState<string[]>(dashboard.courses[0]?.academicClassIds ?? [])
  const selectedCourse = dashboard.courses.find((course) => String(course.id) == courseAssignmentId) ?? null

  function toggleCourseClass(classId: string) {
    setSelectedCourseClassIds((current) => (current.includes(classId) ? current.filter((item) => item !== classId) : [...current, classId]))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EditorCard
        title="课程教学班分配"
        actionLabel="保存课程教学班"
        pending={busyKey === 'org:course-assignment'}
        onSubmit={() => {
          if (!selectedCourse) return
          return handleSave(() => onAssignCourseClasses(selectedCourse.id, selectedCourseClassIds), '课程分班已完成', '课程教学班分配已更新。')
        }}
      >
        <Field label="目标课程">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={courseAssignmentId}
            onChange={(event) => {
              const nextCourse = dashboard.courses.find((course) => String(course.id) === event.target.value)
              setCourseAssignmentId(event.target.value)
              setSelectedCourseClassIds(nextCourse?.academicClassIds ?? [])
            }}
          >
            {dashboard.courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.title}
              </option>
            ))}
          </select>
        </Field>
        <ListCard>
          {dashboard.academicClasses.map((academicClass) => (
            <label key={academicClass.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>
                <span className="font-medium text-slate-950">{academicClass.name}</span>
                <span className="ml-2 text-sm text-slate-500">{majorMap.get(academicClass.majorId)?.name ?? academicClass.majorId}</span>
              </span>
              <input type="checkbox" className="h-4 w-4" checked={selectedCourseClassIds.includes(academicClass.id)} onChange={() => toggleCourseClass(academicClass.id)} />
            </label>
          ))}
        </ListCard>
      </EditorCard>
    </div>
  )
}
