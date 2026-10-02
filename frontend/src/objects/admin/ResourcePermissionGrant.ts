// 文件说明：定义管理端资源权限Grant领域数据类型，用于业务流程和接口传输。
export type ResourcePermissionGrant = {
  resourceType: string
  resourceId: string
  principalType: string
  principalId: string
  permissionKey: string
  scope: string
}
