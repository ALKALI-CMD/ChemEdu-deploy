// 文件说明：定义看板AtRisk学生领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type AtRiskStudent = {
  userId: UserId
  studentName: string | string
  courseId: string
  courseTitle: string
  completionRate: number
  studyMinutes: number
  pendingAssignmentCount: number
  pendingQuizCount: number
  averageScore: number
  riskReasons: string[]
}
