// 文件说明：定义考试评定域争分工单领域数据类型，用于学生对判分结果提出异议。
export type ArgueTicket = {
  id: string
  examId: string
  sheetId: string
  studentId: string
  studentName: string
  questionId: string
  questionTitle: string
  reason: string
  status: string
  response: string
  handledByName: string | null
  createdAt: string
  resolvedAt: string | null
}
