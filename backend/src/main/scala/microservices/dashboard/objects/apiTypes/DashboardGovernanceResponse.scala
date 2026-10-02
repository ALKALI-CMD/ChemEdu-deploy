// 文件说明：定义看板看板治理接口响应类型，用于前后端 API 返回值约束。
package microservices.dashboard.objects.apiTypes

import microservices.dashboard.objects.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.objects.{
  AuditTrailEntry,
  DeploymentConfigSummary,
  ObservabilitySnapshot,
  OrganizationChangeLog,
  PermissionMatrixEntry,
  ResourcePermissionGrant,
  TestStrategyItem
}

final case class DashboardGovernanceResponse(
  organizationChangeLogs: List[OrganizationChangeLog],
  permissionMatrix: List[PermissionMatrixEntry],
  resourcePermissionGrants: List[ResourcePermissionGrant],
  auditTrail: List[AuditTrailEntry],
  testStrategy: List[TestStrategyItem],
  observability: ObservabilitySnapshot,
  deploymentConfig: DeploymentConfigSummary
)

object DashboardGovernanceResponse:
  given Encoder[DashboardGovernanceResponse] = deriveEncoder[DashboardGovernanceResponse]
  given Decoder[DashboardGovernanceResponse] = deriveDecoder[DashboardGovernanceResponse]
