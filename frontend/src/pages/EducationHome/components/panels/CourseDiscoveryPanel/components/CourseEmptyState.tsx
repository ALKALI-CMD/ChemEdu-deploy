import { Link } from 'react-router-dom'
import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Button } from '@/components/ui/UiComponents'

type CourseEmptyStateProps = {
  onReset: () => void
  hasCourses?: boolean
}

export default function CourseEmptyState({ onReset, hasCourses = true }: CourseEmptyStateProps) {
  return (
    <EmptyIllustrationState
      kind="courses"
      title={hasCourses ? '没有找到匹配课程' : '化学竞赛课程'}
      message={hasCourses ? '请调整筛选条件。' : '暂无已发布的在线课程。可先查看化学竞赛课程体系，或提交报名咨询。'}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            onClick={onReset}
          >
            重置筛选
          </Button>
          <Button asChild className="rounded-full bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white">
            <Link to="/programs" className="!text-white">
              查看课程体系
            </Link>
          </Button>
        </div>
      }
    />
  )
}
