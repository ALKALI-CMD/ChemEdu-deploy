import { useParams, useSearchParams } from 'react-router-dom'
import EducationPageGuard from '@/components/EducationPageGuard'
import StudentCenterWorkspace from './components/StudentCenterWorkspace'
import type { StudentSection } from './hooks/useStudentCenterModel'
import { sectionCopy } from './objects/studentCenterConfig'

export default function StudentCenter({ section = 'overview' }: { section?: StudentSection }) {
  const { assignmentId, quizId, examId } = useParams()
  const [searchParams] = useSearchParams()
  const focusQuestionId = searchParams.get('question') ?? undefined

  return (
    <EducationPageGuard title={sectionCopy[section].title} description={sectionCopy[section].description}>
      {(dashboard) => (
        <StudentCenterWorkspace
          dashboard={dashboard}
          section={section}
          focusAssignmentId={assignmentId}
          focusQuizId={quizId}
          focusExamId={examId}
          focusQuestionId={focusQuestionId}
        />
      )}
    </EducationPageGuard>
  )
}
