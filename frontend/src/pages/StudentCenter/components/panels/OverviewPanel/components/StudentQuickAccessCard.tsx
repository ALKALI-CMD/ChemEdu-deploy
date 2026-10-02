import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, Target } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'

type StudentQuickAccessCardProps = {
  enrolledCourses: Course[]
  assignments: Assignment[]
  quizzes: Quiz[]
}

export default function StudentQuickAccessCard({
  enrolledCourses,
  assignments,
  quizzes,
}: StudentQuickAccessCardProps) {
  const unfinishedAssignments = assignments.filter((assignment) => assignment.submissionStatus === SubmissionStatus.Pending)
  const activeQuizzes = quizzes.filter((quiz) => quiz.status !== QuizStatus.Finished)
  const todayCourses = enrolledCourses.slice(0, Math.min(1, enrolledCourses.length))

  return (
    <Card className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-950 text-white hover:bg-slate-950">学生首页</Badge>
            <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
              今日课程 {todayCourses.length}
            </Badge>
            <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
              待交作业 {unfinishedAssignments.length}
            </Badge>
            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
              测验 {activeQuizzes.length}
            </Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950">今日学习工作台</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {todayCourses.length > 0
              ? todayCourses.map((course) => `${String(course.title)}：${String(course.schedule)}`).join('；')
              : '今天暂无固定课程安排，可以从我的课程继续学习。'}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <QuickLink icon={BookOpen} label="进入课程" to="/student/courses" primary />
          <QuickLink icon={ClipboardList} label="处理作业" to="/student/assignments" />
          <QuickLink icon={Target} label="查看测验" to="/student/quizzes" />
        </div>
      </CardContent>
    </Card>
  )
}

function QuickLink({
  icon: Icon,
  label,
  to,
  primary = false,
}: {
  icon: typeof BookOpen
  label: string
  to: string
  primary?: boolean
}) {
  return (
    <Button
      asChild
      variant={primary ? 'default' : 'outline'}
      className={`justify-start gap-2 rounded-xl ${primary ? 'bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white' : 'bg-white'}`}
    >
      <Link className={primary ? '!text-white' : undefined} to={to}>
        <Icon className="size-4" />
        {label}
      </Link>
    </Button>
  )
}
