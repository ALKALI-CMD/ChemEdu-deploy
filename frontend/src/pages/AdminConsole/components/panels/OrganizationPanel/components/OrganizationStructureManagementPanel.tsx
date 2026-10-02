import { useState } from 'react'
import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { Input } from '@/components/ui/UiComponents'
import {
  OrganizationEditorCard as EditorCard,
  OrganizationField as Field,
  OrganizationListCard as ListCard,
  OrganizationRowCard as RowCard,
} from './OrganizationSharedComponents'

type OrganizationStructureManagementPanelProps = {
  dashboard: EducationDashboardResponse
  busyKey: string | null
  majorMap: Map<string, Major>
  departmentMap: Map<string, Department>
  handleSave: <T>(runner: () => Promise<T>, successTitle: string, successMessage: string, reset?: () => void) => Promise<void>
  handleDelete: (label: string, runner: () => Promise<string>) => Promise<void>
  onSaveDepartment: (input: { departmentId?: string; name: string }) => Promise<Department>
  onSaveMajor: (input: { majorId?: string; departmentId: string; name: string }) => Promise<Major>
  onSaveAcademicClass: (input: { academicClassId?: string; majorId: string; grade: string; name: string; capacity: number }) => Promise<AcademicClass>
  onSaveSemester: (input: { semesterId?: string; label: string; startAt: string; endAt: string; archived: boolean }) => Promise<SemesterTerm>
  onDeleteDepartment: (departmentId: string) => Promise<string>
  onDeleteMajor: (majorId: string) => Promise<string>
  onDeleteAcademicClass: (academicClassId: string) => Promise<string>
  onDeleteSemester: (semesterId: string) => Promise<string>
}

export default function OrganizationStructureManagementPanel({
  dashboard,
  busyKey,
  majorMap,
  departmentMap,
  handleSave,
  handleDelete,
  onSaveDepartment,
  onSaveMajor,
  onSaveAcademicClass,
  onSaveSemester,
  onDeleteDepartment,
  onDeleteMajor,
  onDeleteAcademicClass,
  onDeleteSemester,
}: OrganizationStructureManagementPanelProps) {
  const [departmentForm, setDepartmentForm] = useState({ departmentId: '', name: '' })
  const [majorForm, setMajorForm] = useState({ majorId: '', departmentId: dashboard.departments[0]?.id ?? '', name: '' })
  const [academicClassForm, setAcademicClassForm] = useState({
    academicClassId: '',
    majorId: dashboard.majors[0]?.id ?? '',
    grade: '',
    name: '',
    capacity: 40,
  })
  const [semesterForm, setSemesterForm] = useState({
    semesterId: '',
    label: '',
    startAt: '',
    endAt: '',
    archived: false,
  })

  function resetDepartmentForm() {
    setDepartmentForm({ departmentId: '', name: '' })
  }

  function resetMajorForm() {
    setMajorForm({ majorId: '', departmentId: dashboard.departments[0]?.id ?? '', name: '' })
  }

  function resetAcademicClassForm() {
    setAcademicClassForm({
      academicClassId: '',
      majorId: dashboard.majors[0]?.id ?? '',
      grade: '',
      name: '',
      capacity: 40,
    })
  }

  function resetSemesterForm() {
    setSemesterForm({ semesterId: '', label: '', startAt: '', endAt: '', archived: false })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EditorCard title="院系管理" actionLabel={departmentForm.departmentId ? '保存院系' : '新增院系'} pending={busyKey === 'org:department'} onSubmit={() => handleSave(() => onSaveDepartment({ departmentId: departmentForm.departmentId || undefined, name: departmentForm.name }), '院系已保存', '院系信息已更新。', resetDepartmentForm)}>
        <Field label="院系名称">
          <Input value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <ListCard>
          {dashboard.departments.map((department) => (
            <RowCard
              key={department.id}
              title={department.name}
              subtitle={department.id}
              onEdit={() => setDepartmentForm({ departmentId: department.id, name: department.name })}
              onDelete={() => void handleDelete(`院系 ${department.name}`, () => onDeleteDepartment(department.id))}
            />
          ))}
        </ListCard>
      </EditorCard>

      <EditorCard title="专业管理" actionLabel={majorForm.majorId ? '保存专业' : '新增专业'} pending={busyKey === 'org:major'} onSubmit={() => handleSave(() => onSaveMajor({ majorId: majorForm.majorId || undefined, departmentId: majorForm.departmentId, name: majorForm.name }), '专业已保存', '专业信息已更新。', resetMajorForm)}>
        <Field label="所属院系">
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={majorForm.departmentId} onChange={(event) => setMajorForm((current) => ({ ...current, departmentId: event.target.value }))}>
            {dashboard.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="专业名称">
          <Input value={majorForm.name} onChange={(event) => setMajorForm((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <ListCard>
          {dashboard.majors.map((major) => (
            <RowCard
              key={major.id}
              title={major.name}
              subtitle={departmentMap.get(major.departmentId)?.name ?? major.departmentId}
              onEdit={() => setMajorForm({ majorId: major.id, departmentId: major.departmentId, name: major.name })}
              onDelete={() => void handleDelete(`专业 ${major.name}`, () => onDeleteMajor(major.id))}
            />
          ))}
        </ListCard>
      </EditorCard>

      <EditorCard title="教学班管理" actionLabel={academicClassForm.academicClassId ? '保存教学班' : '新增教学班'} pending={busyKey === 'org:class'} onSubmit={() => handleSave(() => onSaveAcademicClass({ academicClassId: academicClassForm.academicClassId || undefined, majorId: academicClassForm.majorId, grade: academicClassForm.grade, name: academicClassForm.name, capacity: academicClassForm.capacity }), '教学班已保存', '教学班信息已更新。', resetAcademicClassForm)}>
        <Field label="所属专业">
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={academicClassForm.majorId} onChange={(event) => setAcademicClassForm((current) => ({ ...current, majorId: event.target.value }))}>
            {dashboard.majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="年级">
          <Input value={academicClassForm.grade} onChange={(event) => setAcademicClassForm((current) => ({ ...current, grade: event.target.value }))} />
        </Field>
        <Field label="班级名称">
          <Input value={academicClassForm.name} onChange={(event) => setAcademicClassForm((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <Field label="容量">
          <Input type="number" min={1} value={academicClassForm.capacity} onChange={(event) => setAcademicClassForm((current) => ({ ...current, capacity: Math.max(1, Number(event.target.value) || 1) }))} />
        </Field>
        <ListCard>
          {dashboard.academicClasses.map((academicClass) => (
            <RowCard
              key={academicClass.id}
              title={academicClass.name}
              subtitle={`${majorMap.get(academicClass.majorId)?.name ?? academicClass.majorId} / ${academicClass.grade} / ${academicClass.studentIds.length}/${academicClass.capacity}`}
              onEdit={() => setAcademicClassForm({ academicClassId: academicClass.id, majorId: academicClass.majorId, grade: academicClass.grade, name: academicClass.name, capacity: academicClass.capacity })}
              onDelete={() => void handleDelete(`教学班 ${academicClass.name}`, () => onDeleteAcademicClass(academicClass.id))}
            />
          ))}
        </ListCard>
      </EditorCard>

      <EditorCard title="学期管理" actionLabel={semesterForm.semesterId ? '保存学期' : '新增学期'} pending={busyKey === 'org:semester'} onSubmit={() => handleSave(() => onSaveSemester({ semesterId: semesterForm.semesterId || undefined, label: semesterForm.label, startAt: semesterForm.startAt, endAt: semesterForm.endAt, archived: semesterForm.archived }), '学期已保存', '学期信息已更新。', resetSemesterForm)}>
        <Field label="学期名称">
          <Input value={semesterForm.label} onChange={(event) => setSemesterForm((current) => ({ ...current, label: event.target.value }))} />
        </Field>
        <Field label="开始日期">
          <Input value={semesterForm.startAt} onChange={(event) => setSemesterForm((current) => ({ ...current, startAt: event.target.value }))} />
        </Field>
        <Field label="结束日期">
          <Input value={semesterForm.endAt} onChange={(event) => setSemesterForm((current) => ({ ...current, endAt: event.target.value }))} />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" checked={semesterForm.archived} onChange={(event) => setSemesterForm((current) => ({ ...current, archived: event.target.checked }))} />
          <span>已归档</span>
        </label>
        <ListCard>
          {dashboard.semesters.map((semester) => (
            <RowCard
              key={semester.id}
              title={semester.label}
              subtitle={`${semester.startAt} - ${semester.endAt} / ${semester.archived ? '已归档' : '进行中'}`}
              onEdit={() => setSemesterForm({ semesterId: semester.id, label: semester.label, startAt: semester.startAt, endAt: semester.endAt, archived: semester.archived })}
              onDelete={() => void handleDelete(`学期 ${semester.label}`, () => onDeleteSemester(semester.id))}
            />
          ))}
        </ListCard>
      </EditorCard>
    </div>
  )
}
