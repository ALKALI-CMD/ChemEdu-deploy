// 文件说明：定义课程目录学习PathRecommendation领域数据类型，用于业务流程和接口传输。

export type LearningPathRecommendation = {
  id: string
  title: string
  courseIds: string[]
  reason: string
  estimatedHours: number
}
