// 文件说明：定义管理端审核课程领域数据类型，用于业务流程和接口传输。
import type { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'

export type AuditCourseInput = {
  courseId: string
  auditStatus: CourseAuditStatus
  auditComment: string
}
