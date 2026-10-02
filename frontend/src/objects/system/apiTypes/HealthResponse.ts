// 文件说明：定义系统示例健康检查接口响应类型，用于前后端 API 返回值约束。
export type HealthResponse = {
  status: string
  service: string
}
