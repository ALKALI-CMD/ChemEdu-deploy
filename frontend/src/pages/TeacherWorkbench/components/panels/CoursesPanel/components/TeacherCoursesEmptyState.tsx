import { EmptyIllustrationState } from '@/components/education/VisualStates'

export default function TeacherCoursesEmptyState() {
  return (
    <EmptyIllustrationState
      kind="courses"
      title="暂无符合条件的课程"
      message="暂无匹配课程。"
    />
  )
}
