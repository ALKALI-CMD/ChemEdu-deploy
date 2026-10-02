// 文件说明：定义学习课程进度Stats领域数据类型，用于业务流程和接口传输。

export type CourseProgressStats = {
  courseId: string
  completedLessons: number
  totalLessons: number
  studyMinutes: number
  completionRate: number
}
