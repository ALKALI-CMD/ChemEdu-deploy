// 文件说明：定义考试评定域培训期次领域数据类型，用于业务流程和接口传输。
export type TrainingCohort = {
  id: string
  name: string
  season: string
  startDate: string
  endDate: string
  description: string
  memberIds: string[]
  status: string
  createdBy: string | null
  createdAt: string
}
