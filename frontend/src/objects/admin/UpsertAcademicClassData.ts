// 文件说明：定义管理端新增或更新教学班级领域数据类型，用于业务流程和接口传输。
export type UpsertAcademicClassData = {
  academicClassId?: string
  majorId: string
  grade: string
  name: string
  capacity: number
}
