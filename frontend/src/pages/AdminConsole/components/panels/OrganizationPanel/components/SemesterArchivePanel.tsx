import type { SemesterTerm } from '@/objects/admin/SemesterTerm'
import type { Course } from '@/objects/course/catalog/Course'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'

type SemesterArchivePanelProps = {
  semesters: SemesterTerm[]
  courses: Course[]
  busyKey: string | null
  onArchiveSemester: (semesterId: string) => void
}

export default function SemesterArchivePanel({
  semesters,
  courses,
  busyKey,
  onArchiveSemester,
}: SemesterArchivePanelProps) {
  const activeSemesterCount = semesters.filter((semester) => !semester.archived).length

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>结课归档</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>进行中学期：{activeSemesterCount}</p>
          {semesters.map((semester) => {
            const linkedCourseCount = courses.filter((course) => course.semesterLabel === semester.label).length
            const busy = busyKey === `org:semester-archive:${semester.id}`
            return (
              <div key={semester.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{semester.label}</p>
                    <p className="mt-1">{semester.archived ? '已归档' : '进行中'} / 关联课程 {linkedCourseCount}</p>
                  </div>
                  <Button size="sm" disabled={semester.archived || busy} onClick={() => onArchiveSemester(semester.id)}>
                    归档学期与课程
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
