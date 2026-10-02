// 文件说明：定义课程讨论平台举报领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type PlatformReport = {
  id: string
  reporterId: UserId
  reporterName: string
  targetType: string
  targetId: string
  targetLabel: string
  reason: string
  detail?: string
  status: string
  createdAt: string
  resolvedBy?: string
  resolvedAt?: string
  resolutionNote?: string
}
