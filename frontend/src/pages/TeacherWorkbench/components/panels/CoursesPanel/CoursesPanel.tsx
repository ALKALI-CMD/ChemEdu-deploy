import CourseEditorPanel from '@/components/CourseEditorPanel'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/UiComponents'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { Course } from '@/objects/course/catalog/Course'
import TeacherCoursesPanel from './components/TeacherCoursesPanel'

type TeacherCoursesSectionProps = {
  teacherCourses: Course[]
  canManage: boolean
  selectedCourseId: string | null
  selectedCourseIds: string[]
  courseFormMode: 'edit' | 'create'
  setSelectedCourseId: (courseId: string) => void
  setCourseFormMode: (mode: 'edit' | 'create') => void
  setSelectedCourseIds: React.Dispatch<React.SetStateAction<string[]>>
  selectedCourse: Course | null
  editingCourse: Course | undefined
  canDirectPublishCourse: boolean
  dashboardUsers: UserProfile[]
  onToggleCourseStatus: (courseId: string, nextStatus: CourseStatus) => Promise<void>
  onBatchStatusChange: (courseIds: string[], nextStatus: CourseStatus) => Promise<void>
  onSaveCourse: (input: CourseEditorInput) => Promise<void>
}

export default function TeacherCoursesSection({
  teacherCourses,
  canManage,
  selectedCourseId,
  selectedCourseIds,
  courseFormMode,
  setSelectedCourseId,
  setCourseFormMode,
  setSelectedCourseIds,
  selectedCourse,
  editingCourse,
  canDirectPublishCourse,
  dashboardUsers,
  onToggleCourseStatus,
  onBatchStatusChange,
  onSaveCourse,
}: TeacherCoursesSectionProps) {
  const showingEditor = courseFormMode === 'create' || Boolean(editingCourse)

  return (
    <section className={showingEditor ? 'grid gap-6 lg:grid-cols-[0.88fr_1.12fr]' : 'grid gap-6'}>
      <TeacherCoursesPanel
        courses={teacherCourses}
        canManage={canManage}
        selectedCourseId={selectedCourseId}
        selectedCourseIds={selectedCourseIds}
        onSelectCourse={(courseId) => {
          setSelectedCourseId(courseId)
          setCourseFormMode('edit')
        }}
        onToggleStatus={async (course) =>
          void (await onToggleCourseStatus(
            course.id,
            course.status === CourseStatus.Published ? CourseStatus.Archived : CourseStatus.Published,
          ))
        }
        onToggleCourseSelection={(courseId) =>
          setSelectedCourseIds((current) =>
            current.includes(courseId) ? current.filter((item) => item !== courseId) : [...current, courseId],
          )
        }
        onSelectAllFiltered={(courseIds) => setSelectedCourseIds(courseIds)}
        onClearSelection={() => setSelectedCourseIds([])}
        onBatchStatusChange={onBatchStatusChange}
      />

      <div className="grid gap-3">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            asChild
            className={
              editingCourse
                ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                : 'rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-100'
            }
          >
            <Link to={selectedCourse ? `/teacher/courses/${selectedCourse.id}` : '/teacher/courses'}>编辑选中课程</Link>
          </Button>
          <Button
            asChild
            className={
              !editingCourse
                ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                : 'rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-100'
            }
          >
            <Link to="/teacher/courses/new">新建课程</Link>
          </Button>
        </div>

        {showingEditor ? (
          <CourseEditorPanel
            key={editingCourse?.id ?? 'create-course'}
            title={editingCourse ? `编辑课程：${editingCourse.title}` : '新建课程'}
            actionLabel={editingCourse ? '保存课程' : '创建课程'}
            assistantUsers={dashboardUsers}
            course={editingCourse}
            allowDirectPublish={canDirectPublishCourse}
            onSubmit={onSaveCourse}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
            请选择课程或新建课程。
          </div>
        )}
      </div>
    </section>
  )
}
