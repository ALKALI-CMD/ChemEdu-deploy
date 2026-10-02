import CourseEditorPanel from '@/components/CourseEditorPanel'
import { PermissionStateCard } from '@/components/ExperienceState'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { TeachingInsightSnapshot } from '@/objects/dashboard/TeachingInsightSnapshot'
import CourseMetaPanel from '../LearningPanel/components/CourseMetaPanel'
import ManageActionsCard from './components/ManageActionsCard'
import ManageAuditCard from './components/ManageAuditCard'
import ManageEditorEntryCard from './components/ManageEditorEntryCard'
import ManageStatusCard from './components/ManageStatusCard'

type ManagePanelProps = {
  canManage: boolean
  course: Course
  enrolled: boolean
  teacherName: string
  assistantNames: string
  teachingInsights: TeachingInsightSnapshot
  users: UserProfile[]
  onSaveCourse: (input: CourseEditorInput) => Promise<void>
  onUpdateCourseStatus: (status: CourseStatus) => Promise<unknown>
}

export default function ManagePanel(props: ManagePanelProps) {
  if (!props.canManage) {
    return <PermissionStateCard title="当前没有管理权限" message="只有课程教师或管理员可以进入这门课程的教师管理区。" />
  }

  const { course } = props
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <ManageStatusCard
          course={course}
          teacherName={props.teacherName}
          assistantNames={props.assistantNames}
          teachingInsights={props.teachingInsights}
        />
        <ManageAuditCard course={course} />
        <ManageActionsCard
          course={course}
          onToggleStatus={() =>
            void props.onUpdateCourseStatus(
              course.status === CourseStatus.Published ? CourseStatus.Archived : CourseStatus.Published,
            )
          }
        />
        <CourseMetaPanel
          course={course}
          enrolled={props.enrolled}
          teacherName={props.teacherName}
          assistantNames={props.assistantNames}
        />
      </div>
      <div className="space-y-6">
        <ManageEditorEntryCard />
        <CourseEditorPanel
          title="编辑当前课程"
          actionLabel="保存当前课程"
          assistantUsers={props.users}
          course={course}
          onSubmit={props.onSaveCourse}
        />
      </div>
    </section>
  )
}
