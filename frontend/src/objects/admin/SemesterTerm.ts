// 文件说明：定义管理端学期Term领域数据类型，用于业务流程和接口传输。
export type SemesterTerm = {
  id: string
  label: string
  startAt: string
  endAt: string
  archived: boolean
}
