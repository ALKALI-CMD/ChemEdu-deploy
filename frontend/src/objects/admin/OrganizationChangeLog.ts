// 文件说明：定义管理端组织修改Log领域数据类型，用于业务流程和接口传输。

export type OrganizationChangeLog = {
  id: string
  actorName: string
  action: string
  targetType: string
  targetId: string
  detail: string
  createdAt: string
}
