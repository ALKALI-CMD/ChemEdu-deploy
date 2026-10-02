// 文件说明：定义看板看板治理接口响应类型，用于前后端 API 返回值约束。
import type { AuditTrailEntry } from '@/objects/admin/AuditTrailEntry'
import type { DeploymentConfigSummary } from '@/objects/admin/DeploymentConfigSummary'
import type { ObservabilitySnapshot } from '@/objects/admin/ObservabilitySnapshot'
import type { OrganizationChangeLog } from '@/objects/admin/OrganizationChangeLog'
import type { PermissionMatrixEntry } from '@/objects/admin/PermissionMatrixEntry'
import type { ResourcePermissionGrant } from '@/objects/admin/ResourcePermissionGrant'
import type { TestStrategyItem } from '@/objects/admin/TestStrategyItem'

export type DashboardGovernanceResponse = {
  organizationChangeLogs: OrganizationChangeLog[]
  permissionMatrix: PermissionMatrixEntry[]
  resourcePermissionGrants: ResourcePermissionGrant[]
  auditTrail: AuditTrailEntry[]
  testStrategy: TestStrategyItem[]
  observability: ObservabilitySnapshot
  deploymentConfig: DeploymentConfigSummary
}
