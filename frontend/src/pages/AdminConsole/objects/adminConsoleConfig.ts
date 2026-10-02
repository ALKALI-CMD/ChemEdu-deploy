// 文件说明：定义业务adminConsole配置领域数据类型，用于业务流程和接口传输。
import { UserRole } from '@/objects/auth/UserRole'
import { CourseAuditStatus } from '@/objects/course/catalog/CourseAuditStatus'

type AdminSection = 'overview' | 'audits' | 'users' | 'governance' | 'organization' | 'business' | 'system'

type OperationLogItem = {
  id: string
  actor: string
  action: string
  target: string
  detail?: string
  createdAt: string
}

const roleLabel: Record<UserRole, string> = {
  [UserRole.Student]: '学生',
  [UserRole.Teacher]: '教研老师',
  [UserRole.Assistant]: '助教老师',
  [UserRole.Analyst]: '数据分析处',
  [UserRole.Admin]: '校长',
}

const statusLabel: Record<string, string> = {
  published: '已发布',
  draft: '草稿',
  archived: '已下架',
}

const auditLabel: Record<CourseAuditStatus, string> = {
  [CourseAuditStatus.Pending]: '待审核',
  [CourseAuditStatus.Approved]: '已通过',
  [CourseAuditStatus.Rejected]: '已驳回',
}

const roleOptions = [UserRole.Student, UserRole.Teacher, UserRole.Admin] as const

const sectionCopy: Record<AdminSection, { title: string; description: string }> = {
  overview: {
    title: '平台总览',
    description: '平台统计。',
  },
  audits: {
    title: '课程审核',
    description: '审核列表。',
  },
  users: {
    title: '用户权限',
    description: '用户列表。',
  },
  governance: {
    title: '内容治理',
    description: '处理讨论内容状态。',
  },
  organization: {
    title: '教学组织',
    description: '组织数据。',
  },
  business: {
    title: '经营看板',
    description: '经营数据。',
  },
  system: {
    title: '系统治理',
    description: '系统状态。',
  },
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试。'
}

export { auditLabel, getErrorMessage, roleLabel, roleOptions, sectionCopy, statusLabel }
export type { AdminSection, OperationLogItem }
