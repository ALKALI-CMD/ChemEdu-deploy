import { Link } from 'react-router-dom'
import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Button } from '@/components/ui/UiComponents'

type CourseEmptyStateProps = {
  onReset: () => void
}

export default function CourseEmptyState({ onReset }: CourseEmptyStateProps) {
  return (
    <EmptyIllustrationState
      kind="courses"
      title="没有找到匹配课程"
      message="暂无匹配课程。"
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
            <Link to="/courses" className="!text-white">
              课程发现
            </Link>
          </Button>
        </div>
      }
    />
  )
}
