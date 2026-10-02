import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { GradeDetailItem } from '../../../../hooks/useStudentCenterModel'
import { buildCourseGradeCards, scoreTone } from '../functions/gradeDetailsModel'

type CourseGradeTranscriptCardProps = {
  gradebook: GradebookEntry[]
  courseProgress: CourseProgressStats[]
  gradeDetails: GradeDetailItem[]
}

export default function CourseGradeTranscriptCard({
  gradebook,
  courseProgress,
  gradeDetails,
}: CourseGradeTranscriptCardProps) {
  const courses = buildCourseGradeCards({ gradebook, courseProgress, gradeDetails })

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">课程成绩单</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <EmptyIllustrationState kind="courses" title="暂无课程成绩" message="提交作业、完成测验或产生课程进度后，这里会按课程生成成绩单。" />
        ) : null}

        {courses.map(({ courseId, title, grade, progress, assignments, quizzes }) => {
          const ordinaryScore = grade?.progressScore ?? Math.round(Number(progress?.completionRate ?? 0))
          const totalScore = grade?.totalScore

          return (
            <div key={courseId} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{title}</p>
                </div>
                <Badge className={`rounded-full ${scoreTone(totalScore)} hover:bg-inherit`}>
                  总分 {totalScore !== undefined ? `${totalScore} 分` : '待生成'}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <GradeMetric label="作业成绩" value={grade?.assignmentAverage ?? '--'} detail={`权重 ${grade?.assignmentWeight ?? 0}%`} />
                <GradeMetric label="测验成绩" value={grade?.quizAverage ?? '--'} detail={`权重 ${grade?.quizWeight ?? 0}%`} />
                <GradeMetric label="平时成绩" value={ordinaryScore} detail={`进度权重 ${grade?.progressWeight ?? 0}%`} />
                <GradeMetric
                  label="任务完成率"
                  value={grade?.completedTaskRate ?? `${progress?.completionRate ?? 0}%`}
                  detail={`已完成课时 ${progress?.completedLessons ?? 0} / ${progress?.totalLessons ?? 0}`}
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <GradeItemList title="作业明细" emptyText="暂无作业成绩。" items={assignments} />
                <GradeItemList title="测验明细" emptyText="暂无测验成绩。" items={quizzes} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function GradeMetric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function GradeItemList({ title, emptyText, items }: { title: string; emptyText: string; items: GradeDetailItem[] }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="font-medium text-slate-950">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.timestamp ?? item.status}</p>
              </div>
              <Badge className={`rounded-full ${scoreTone(item.score)} hover:bg-inherit`}>
                {item.score !== undefined ? `${item.score} 分` : item.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
