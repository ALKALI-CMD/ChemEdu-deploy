import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/UiComponents'
import type { PublishSuccess } from '../hooks/useLearningPublishState'

type LearningPublishFeedbackProps = {
  courseOptionsLength: number
  formError: string | null
  publishSuccess: PublishSuccess | null
}

export default function LearningPublishFeedback({
  courseOptionsLength,
  formError,
  publishSuccess,
}: LearningPublishFeedbackProps) {
  return (
    <>
      {courseOptionsLength === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
          当前没有可发布学习任务的课程，请先前往课程管理创建课程。
        </div>
      ) : null}
      {formError ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{formError}</div> : null}
      {publishSuccess ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <p className="font-semibold">发布成功</p>
          <p className="mt-1">
            {publishSuccess.type === 'assignment' ? '作业' : '测验'}“{publishSuccess.title}”已发布到课程“{publishSuccess.courseTitle}”。
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
              <Link to="/teacher/reviews">去批改反馈查看提交</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-emerald-300 bg-emerald-50 hover:bg-emerald-100">
              <Link to="/teacher/courses">返回课程管理</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}
