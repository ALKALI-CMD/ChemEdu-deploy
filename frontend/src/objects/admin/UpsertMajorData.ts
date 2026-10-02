// 文件说明：定义管理端新增或更新专业领域数据类型，用于业务流程和接口传输。
export type UpsertMajorData = {
  majorId?: string
  departmentId: string
  name: string
}
