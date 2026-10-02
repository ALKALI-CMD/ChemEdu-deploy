// 文件说明：定义考试评定域考试实体领域数据类型，用于考试窗口与试卷管理。
import type { ExamQuestion } from './ExamQuestion'
import type { GradingRegion } from './GradingRegion'

export type Exam = {
  id: string
  cohortId: string
  name: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  argueHours: number
  argueDeadline: string | null
  status: string
  questions: ExamQuestion[]
  gradingRegions: Record<string, GradingRegion>
  sheetTemplateImage: string | null
  createdBy: string
  createdAt: string
  releasedAt: string | null
}
