// 文件说明：定义看板课时Bottleneck领域数据类型，用于业务流程和接口传输。

export type LessonBottleneck = {
  courseId: string
  courseTitle: string
  moduleTitle: string | string
  lessonId: string
  lessonTitle: string | string
  completionRate: number
  completedStudentCount: number
  enrolledStudentCount: number
  averageStudyMinutes: number
  requiredStudyMinutes: number
}
