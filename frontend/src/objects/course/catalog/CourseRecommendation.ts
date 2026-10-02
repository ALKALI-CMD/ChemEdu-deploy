// 文件说明：定义课程目录课程Recommendation领域数据类型，用于业务流程和接口传输。

export type CourseRecommendation = {
  courseId: string
  reason: string
  score: number
  recommendationType: string
}
