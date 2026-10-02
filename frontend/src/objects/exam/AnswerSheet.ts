// 文件说明：定义考试评定域答题卡领域数据类型，用于答题卡上传与阅卷。
export type AnswerSheet = {
  id: string
  examId: string
  studentId: string
  studentName: string
  imageDataUrl: string
  status: string
  rawTotal: number | null
  convertedTotal: number | null
  uploadedByName: string
  uploadedAt: string
  gradedAt: string | null
}
