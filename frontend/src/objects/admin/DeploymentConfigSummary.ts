// 文件说明：定义管理端Deployment配置Summary领域数据类型，用于业务流程和接口传输。
export type DeploymentConfigSummary = {
  environments: string[]
  dockerEnabled: boolean
  ciEnabled: boolean
  schemaMode: string
  seedDataMode: string
  configKeys: string[]
}
