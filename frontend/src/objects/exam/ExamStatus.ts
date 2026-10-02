// 文件说明：定义考试评定域考试状态枚举，用于考试窗口生命周期流转。
export const ExamStatus = {
  Draft: 'draft',
  Published: 'published',
  Grading: 'grading',
  Released: 'released',
  Archived: 'archived',
} as const

export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus]

export const examStatusLabel: Record<ExamStatus, string> = {
  draft: '草稿',
  published: '已发布·待考',
  grading: '阅卷中',
  released: '成绩已公布',
  archived: '已归档',
}
