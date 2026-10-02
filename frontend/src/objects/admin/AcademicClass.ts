// 文件说明：定义管理端教学班级领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type AcademicClass = {
  id: string
  majorId: string
  grade: string
  name: string
  capacity: number
  studentIds: UserId[]
}
