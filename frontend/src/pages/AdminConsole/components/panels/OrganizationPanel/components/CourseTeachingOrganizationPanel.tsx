import type { AcademicClass } from '@/objects/admin/AcademicClass'
import type { Department } from '@/objects/admin/Department'
import type { Major } from '@/objects/admin/Major'
import type { Course } from '@/objects/course/catalog/Course'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'

type CourseTeachingOrganizationPanelProps = {
  courses: Course[]
  classMap: Map<string, AcademicClass>
  majorMap: Map<string, Major>
  departmentMap: Map<string, Department>
}

export default function CourseTeachingOrganizationPanel({
  courses,
  classMap,
  majorMap,
  departmentMap,
}: CourseTeachingOrganizationPanelProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>课程教学组织</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        {courses.map((course) => (
          <div key={course.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{course.title}</p>
                <p className="mt-1">
                  {course.semesterLabel || '未设置学期'} / {course.offeringCode || '未设置批次'}
                </p>
              </div>
              <p className="text-slate-500">
                {course.enrolledCount}/{course.capacity}
              </p>
            </div>
            <p className="mt-2">
              教学班：
              {course.academicClassIds.length > 0
                ? course.academicClassIds
                    .map((classId) => {
                      const academicClass = classMap.get(classId)
                      const major = academicClass ? majorMap.get(academicClass.majorId) : null
                      const department = major ? departmentMap.get(major.departmentId) : null
                      return [department?.name, major?.name, academicClass?.name].filter(Boolean).join(' / ')
                    })
                    .join('、')
                : '未分配'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
