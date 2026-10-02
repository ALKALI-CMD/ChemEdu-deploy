// 文件说明：定义学习作业RubricScore领域数据类型，用于业务流程和接口传输。

export type AssignmentRubricScore = {
  criterionId: string
  score: number
  comment?: string
}
