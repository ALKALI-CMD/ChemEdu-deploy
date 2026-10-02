// 文件说明：定义考试评定域成绩册行领域数据类型，用于考试折合分排名。
export type ScoreboardRow = {
  studentId: string
  studentName: string
  questionScores: Record<string, number>
  rawTotal: number
  convertedTotal: number
  rank: number
}
