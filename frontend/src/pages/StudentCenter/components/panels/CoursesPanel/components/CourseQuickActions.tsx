import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/UiComponents'

export default function CourseQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild className="gap-2 rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
        <Link to="/courses">
          <BookOpen className="size-4" />
          去课程发现
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2 rounded-full border-slate-300 bg-white hover:bg-slate-100">
        <Link to="/student/assignments">
          <ClipboardList className="size-4" />
          查看作业
        </Link>
      </Button>
    </div>
  )
}
