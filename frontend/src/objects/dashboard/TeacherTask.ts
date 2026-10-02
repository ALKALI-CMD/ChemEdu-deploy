// 文件说明：定义看板教师Task领域数据类型，用于业务流程和接口传输。
import type { TeacherTaskStatus } from '@/objects/dashboard/TeacherTaskStatus'

export type TeacherTask = {
  id: string
  title: string
  assignee: string
  status: TeacherTaskStatus
}
