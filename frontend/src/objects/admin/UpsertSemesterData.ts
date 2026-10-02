// 文件说明：定义管理端新增或更新学期领域数据类型，用于业务流程和接口传输。
export type UpsertSemesterData = {
  semesterId?: string
  label: string
  startAt: string
  endAt: string
  archived: boolean
}
