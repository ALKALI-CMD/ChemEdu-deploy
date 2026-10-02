import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { ContinueLearningItem } from '../../../../hooks/useStudentCenterModel'
import type { Course } from '@/objects/course/catalog/Course'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

type StudentProgressPanelProps = {
  continueLearning: ContinueLearningItem | null
  enrolledCourses: Course[]
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
}

export default function StudentProgressPanel({
  continueLearning,
  enrolledCourses,
  gradebook,
  courseProgress,
}: StudentProgressPanelProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">学习进度</p>
        </div>

        {continueLearning ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">继续学习</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{text(continueLearning.course.title)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              从第 {continueLearning.moduleIndex + 1} 章第 {continueLearning.lessonIndex + 1} 节继续：{continueLearning.lessonTitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
                <Link to={`/course/${continueLearning.course.id}?lesson=${encodeURIComponent(continueLearning.lessonId)}`}>继续学习</Link>
              </Button>
              <Badge className="rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100">进度 {continueLearning.course.completionRate}%</Badge>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            目前还没有可继续学习的已报名课程。
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {enrolledCourses.slice(0, 2).map((course) => {
            const progress = courseProgress.find((item) => item.courseId === course.id)
            const grade = gradebook.find((item) => item.courseId === course.id)

            return (
              <div key={course.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="font-medium text-slate-950">{text(course.title)}</p>
                <p className="mt-1 text-sm text-slate-500">{text(course.subtitle)}</p>
                <p className="mt-2 text-sm text-slate-600">
                  学习进度 {progress?.completionRate ?? course.completionRate}% / 学习时长 {progress?.studyMinutes ?? 0} 分钟
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  课程总评 {grade?.totalScore ?? 0} / 任务完成率 {grade?.completedTaskRate ?? '0%'}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
