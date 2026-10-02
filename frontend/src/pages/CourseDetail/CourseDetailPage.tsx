import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import EducationPageGuard from '@/components/EducationPageGuard'
import CourseDetailWorkspace from './components/CourseDetailWorkspace'

export default function CourseDetail({ view = 'full' }: { view?: 'full' | 'discussion' | 'manage' }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const focusLessonId = searchParams.get('lesson') ?? undefined

  return (
    <EducationPageGuard title="课程详情" description="查看课程内容、讨论和管理信息。">
      {(dashboard) => (
        <CourseDetailWorkspace
          dashboard={dashboard}
          view={view}
          courseId={id}
          focusLessonId={focusLessonId}
          onOpenLessonDiscussion={(courseId, lessonId) => navigate(`/course/${courseId}/discussions?lesson=${lessonId}`)}
        />
      )}
    </EducationPageGuard>
  )
}
