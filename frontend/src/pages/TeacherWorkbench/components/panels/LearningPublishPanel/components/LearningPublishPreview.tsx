import { Badge, Button } from '@/components/ui/UiComponents'

type LearningPublishPreviewProps = {
  previewMode: 'assignment' | 'quiz' | null
  previewCourseTitle: (courseId: string) => string
  assignmentCourseId: string
  assignmentTitle: string
  assignmentDeadline: string
  assignmentAttachmentLabel: string
  assignmentDescription: string
  assignmentMaxAttempts: string
  allowLateSubmission: boolean
  allowResubmission: boolean
  assignmentRubricCount: number
  assignmentReferenceCount: number
  quizCourseId: string
  quizTitle: string
  durationMinutes: string
  objectiveQuestionCount: string
  subjectiveQuestionCount: string
  drawCount: string
  shuffleQuestions: boolean
  shuffleOptions: boolean
  questionBankQuestionCount: number
  questionBankTotalPoints: number
  answerKeys: string
  publishing: boolean
  onPublishAssignment: () => void
  onPublishQuiz: () => void
}

export default function LearningPublishPreview({
  previewMode,
  previewCourseTitle,
  assignmentCourseId,
  assignmentTitle,
  assignmentDeadline,
  assignmentAttachmentLabel,
  assignmentDescription,
  assignmentMaxAttempts,
  allowLateSubmission,
  allowResubmission,
  assignmentRubricCount,
  assignmentReferenceCount,
  quizCourseId,
  quizTitle,
  durationMinutes,
  objectiveQuestionCount,
  subjectiveQuestionCount,
  drawCount,
  shuffleQuestions,
  shuffleOptions,
  questionBankQuestionCount,
  questionBankTotalPoints,
  answerKeys,
  publishing,
  onPublishAssignment,
  onPublishQuiz,
}: LearningPublishPreviewProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-950">发布预览</p>
      </div>

      {previewMode === 'assignment' ? (
        <div className="mt-5 space-y-4">
          <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">作业预览</Badge>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p>课程：{previewCourseTitle(assignmentCourseId)}</p>
            <p>标题：{assignmentTitle || '未填写'}</p>
            <p>截止时间：{assignmentDeadline || '未填写'}</p>
            <p>任务对象：本课程学生</p>
            <p>参考资料标签：{assignmentAttachmentLabel || '无'}</p>
            <p>最多提交次数：{assignmentMaxAttempts || '1'} 次</p>
            <p>迟交策略：{allowLateSubmission ? '允许迟交' : '不允许迟交'}</p>
            <p>重做策略：{allowResubmission ? '允许重做' : '不允许重做'}</p>
            <p>Rubric 维度：{assignmentRubricCount} 项</p>
            <p>参考附件：{assignmentReferenceCount} 份</p>
          </div>
          <p className="text-sm text-slate-600">{assignmentDescription || '暂无作业要求。'}</p>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            disabled={publishing}
            onClick={onPublishAssignment}
          >
            确认发布作业
          </Button>
        </div>
      ) : null}

      {previewMode === 'quiz' ? (
        <div className="mt-5 space-y-4">
          <Badge className="rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100">测验预览</Badge>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p>课程：{previewCourseTitle(quizCourseId)}</p>
            <p>标题：{quizTitle || '未填写'}</p>
            <p>考试时长：{durationMinutes || '未填写'} 分钟</p>
            <p>
              题量结构：客观题 {objectiveQuestionCount || '0'} 道 / 主观题 {subjectiveQuestionCount || '0'} 道
            </p>
            <p>结构化题库：{questionBankQuestionCount} 道，总分 {questionBankTotalPoints}</p>
            <p>随机抽题：{drawCount ? `每位学生抽 ${drawCount} 道` : '不抽题，整卷发放'}</p>
            <p>题目顺序：{shuffleQuestions ? '随机打乱' : '保持原顺序'}</p>
            <p>选项顺序：{shuffleOptions ? '客观题随机选项' : '保持原顺序'}</p>
            <p>答案键：{answerKeys || '将按题库自动推导'}</p>
          </div>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            disabled={publishing}
            onClick={onPublishQuiz}
          >
            确认发布测验
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          暂无发布预览。
        </div>
      )}
    </div>
  )
}
