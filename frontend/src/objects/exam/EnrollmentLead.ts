// 文件说明：定义官网报名线索领域数据类型，用于收集招生咨询信息。
export type EnrollmentLead = {
  id: string
  studentName: string
  contact: string
  gradeLevel: string
  targetStage: string
  courseInterest: string
  message: string
  status: string
  createdAt: string
}
