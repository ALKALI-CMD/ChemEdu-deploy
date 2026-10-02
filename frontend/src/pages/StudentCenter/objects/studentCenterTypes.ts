// 文件说明：定义业务studentCenterTypes领域数据类型，用于业务流程和接口传输。
import type { Course } from '@/objects/course/catalog/Course'

export type StudentSection =
  | 'overview'
  | 'exams'
  | 'courses'
  | 'assignments'
  | 'quizzes'
  | 'wrongbook'
  | 'grades'
  | 'orders'

export type ContinueLearningItem = {
  course: Course
  moduleIndex: number
  lessonIndex: number
  lessonId: string
  lessonTitle: string
}

export type TimelineItem = {
  id: string
  category: 'assignment' | 'quiz' | 'course'
  assignmentId?: string
  quizId?: string
  courseId?: string
  lessonId?: string
  title: string
  subtitle: string
  status: string
  timestampLabel: string
  priority: number
  sortTime: number
}

export type WrongQuestionItem = {
  id: string
  courseId: string
  quizId: string
  questionId: string
  courseTitle: string
  quizTitle: string
  prompt: string
  questionType: string
  submittedAnswers: string[]
  correctAnswers: string[]
  explanation?: string
}

export type GradeDetailItem = {
  id: string
  courseId: string
  courseTitle: string
  category: 'assignment' | 'quiz' | 'course'
  title: string
  score?: number
  status: string
  timestamp?: string
}

export type GradeTrendPoint = {
  id: string
  label: string
  score: number
  timestamp: string
  category: 'assignment' | 'quiz' | 'course'
}

export type LatestScoreItem = {
  id: string
  category: 'assignment' | 'quiz' | 'course'
  title: string
  subtitle: string
  score: number
  timestamp: string
}
