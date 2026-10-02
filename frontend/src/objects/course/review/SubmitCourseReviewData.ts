// 文件说明：定义课程评价提交课程评价/批改领域数据类型，用于业务流程和接口传输。

export type SubmitCourseReviewData = {
  courseId: string
  rating: number
  content: string
}
