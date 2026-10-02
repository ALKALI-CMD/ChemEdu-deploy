// 文件说明：定义看板课程完成度Distribution领域数据类型，用于业务流程和接口传输。

export type CourseCompletionDistribution = {
  courseId: string
  courseTitle: string
  excellentCount: number
  steadyCount: number
  warningCount: number
  stuckCount: number
  averageCompletionRate: number
}
