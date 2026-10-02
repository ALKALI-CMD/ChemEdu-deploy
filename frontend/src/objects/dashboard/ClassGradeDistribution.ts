// 文件说明：定义看板班级成绩Distribution领域数据类型，用于业务流程和接口传输。

export type ClassGradeDistribution = {
  courseId: string
  courseTitle: string
  academicClassId: string
  academicClassName: string
  studentCount: number
  averageScore: number
  passRate: string
  excellentRate: string
  failCount: number
  passCount: number
  goodCount: number
  excellentCount: number
}
