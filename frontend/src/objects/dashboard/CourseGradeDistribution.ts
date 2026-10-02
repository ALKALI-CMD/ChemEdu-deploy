// 文件说明：定义看板课程成绩Distribution领域数据类型，用于业务流程和接口传输。

export type CourseGradeDistribution = {
  courseId: string
  courseTitle: string
  studentCount: number
  averageScore: number
  passRate: string
  excellentRate: string
  failCount: number
  passCount: number
  goodCount: number
  excellentCount: number
}
