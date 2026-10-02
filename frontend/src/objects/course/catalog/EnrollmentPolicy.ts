// 文件说明：定义课程目录报名Policy领域数据类型，用于业务流程和接口传输。
export type EnrollmentPolicy = {
  requiresApproval: boolean
  openAt?: string
  closeAt?: string
  waitlistEnabled: boolean
  inviteCode?: string
}
