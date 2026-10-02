import { useState } from 'react'
import { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { Button } from '@/components/ui/UiComponents'
import {
  OrganizationEditorCard as EditorCard,
  OrganizationField as Field,
  OrganizationListCard as ListCard,
} from './OrganizationSharedComponents'

type StudentClassAssignmentPanelProps = {
  dashboard: EducationDashboardResponse
  busyKey: string | null
  handleSave: <T>(runner: () => Promise<T>, successTitle: string, successMessage: string, reset?: () => void) => Promise<void>
  onAssignStudents: (academicClassId: string, studentIds: string[]) => Promise<string>
  onClearStudentsClass: (studentIds: string[]) => Promise<string>
}

export default function StudentClassAssignmentPanel({
  dashboard,
  busyKey,
  handleSave,
  onAssignStudents,
  onClearStudentsClass,
}: StudentClassAssignmentPanelProps) {
  const [studentAssignmentClassId, setStudentAssignmentClassId] = useState(dashboard.academicClasses[0]?.id ?? '')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const studentUsers = dashboard.users.filter((user) => user.role === UserRole.Student)

  function toggleStudent(userId: string) {
    setSelectedStudentIds((current) => (current.includes(userId) ? current.filter((item) => item !== userId) : [...current, userId]))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EditorCard title="学生批量调班" actionLabel="保存学生班级" pending={busyKey === 'org:student-assignment'} onSubmit={() => handleSave(() => onAssignStudents(studentAssignmentClassId, selectedStudentIds), '学生调班已完成', '学生班级归属已更新。')}>
        <Field label="目标教学班">
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={studentAssignmentClassId} onChange={(event) => setStudentAssignmentClassId(event.target.value)}>
            {dashboard.academicClasses.map((academicClass) => (
              <option key={academicClass.id} value={academicClass.id}>
                {academicClass.name}
              </option>
            ))}
          </select>
        </Field>
        <ListCard>
          {studentUsers.map((student) => (
            <label key={student.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>
                <span className="font-medium text-slate-950">{student.name}</span>
                <span className="ml-2 text-sm text-slate-500">{student.academicClassName || '未分班'}</span>
              </span>
              <input type="checkbox" className="h-4 w-4" checked={selectedStudentIds.includes(String(student.id))} onChange={() => toggleStudent(String(student.id))} />
            </label>
          ))}
        </ListCard>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => void handleSave(() => onClearStudentsClass(selectedStudentIds), '学生退班已完成', '已清空所选学生的班级归属。')}
          disabled={busyKey === 'org:student-clear'}
        >
          {busyKey === 'org:student-clear' ? '处理中...' : '清空所选学生班级'}
        </Button>
      </EditorCard>
    </div>
  )
}
