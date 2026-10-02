// 文件说明：定义认证用户角色领域数据类型，用于业务流程和接口传输。
// 角色语义（清北营考试评定平台）：学生 / 教研老师(teacher) / 助教老师(assistant) / 数据分析处(analyst) / 校长(admin)
export const UserRole = {
  Student: 'student',
  Teacher: 'teacher',
  Assistant: 'assistant',
  Analyst: 'analyst',
  Admin: 'admin',
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export const userRoleLabel: Record<UserRole, string> = {
  student: '学生',
  teacher: '教研老师',
  assistant: '助教老师',
  analyst: '数据分析处',
  admin: '校长',
}
