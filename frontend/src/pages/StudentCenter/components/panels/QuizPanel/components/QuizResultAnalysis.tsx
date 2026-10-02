import type { Quiz } from '@/objects/course/learning/Quiz'
import QuizQuestionResultList from './QuizQuestionResultList'
import QuizResultSummaryCards from './QuizResultSummaryCards'
import QuizScoreMasteryPanels from './QuizScoreMasteryPanels'
import QuizTypeKnowledgeStats from './QuizTypeKnowledgeStats'
import type { CoursePerformanceCard } from '../functions/quizPanelUtils'

type QuizResultAnalysisProps = {
  quiz: Quiz
  coursePerformance: CoursePerformanceCard[]
  finishedQuizzes: Quiz[]
}

export default function QuizResultAnalysis({
  quiz,
  coursePerformance,
  finishedQuizzes,
}: QuizResultAnalysisProps) {
  return (
    <div className="mt-5 space-y-5">
      <QuizResultSummaryCards quiz={quiz} coursePerformance={coursePerformance} />
      <QuizTypeKnowledgeStats quiz={quiz} />
      <QuizScoreMasteryPanels quiz={quiz} finishedQuizzes={finishedQuizzes} />
      <QuizQuestionResultList quiz={quiz} />
    </div>
  )
}
