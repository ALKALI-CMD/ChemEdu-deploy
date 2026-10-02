// 文件说明：定义学习成绩册Entry领域数据类型，用于业务流程和接口传输。

export type GradebookEntry = {
  courseId: string
  courseTitle: string
  assignmentAverage: number
  quizAverage: number
  progressScore: number
  totalScore: number
  assignmentWeight: number
  quizWeight: number
  progressWeight: number
  completedTaskRate: string
}
