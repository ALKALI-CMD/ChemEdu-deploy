import { Badge } from '@/components/ui/UiComponents'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import type { Quiz } from '@/objects/course/learning/Quiz'
import GradebookMetric from './GradebookMetric'
import { distributionTone } from '../functions/gradebookUtils'

type CompletionDistribution = {
  courseId: string
  excellentCount: number
  steadyCount: number
  warningCount: number
  stuckCount: number
}

type CourseGradeDetailCardProps = {
  entry: GradebookEntry
  progress?: CourseProgressStats
  assignments: Assignment[]
  quizzes: Quiz[]
  distribution?: CompletionDistribution
  courseTitle: string
}

export default function CourseGradeDetailCard({
  entry,
  progress,
  assignments,
  quizzes,
  distribution,
  courseTitle,
}: CourseGradeDetailCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-3 lg:grid-cols-[1.35fr_repeat(5,0.8fr)]">
        <div>
          <p className="font-semibold text-slate-950">{courseTitle}</p>
          <p className="mt-1 text-sm text-slate-500">
            已完成课时 {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0} / 学习 {progress?.studyMinutes ?? 0} 分钟
          </p>
          <p className="mt-1 text-xs text-slate-500">
            权重口径：作业 {entry.assignmentWeight}% / 测验 {entry.quizWeight}% / 进度 {entry.progressWeight}%
          </p>
        </div>
        <GradebookMetric label="作业均分" value={entry.assignmentAverage} />
        <GradebookMetric label="测验均分" value={entry.quizAverage} />
        <GradebookMetric label="进度得分" value={entry.progressScore} />
        <GradebookMetric label="课程总评" value={entry.totalScore} />
        <GradebookMetric label="任务完成率" value={entry.completedTaskRate} />
      </div>

      {distribution ? (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <GradebookMetric label="优秀学生" value={distribution.excellentCount} />
          <GradebookMetric label="稳定推进" value={distribution.steadyCount} />
          <GradebookMetric label="需要提醒" value={distribution.warningCount} />
          <GradebookMetric label="明显掉队" value={distribution.stuckCount} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <CourseGradeAssignmentList assignments={assignments} />
        <CourseGradeQuizList quizzes={quizzes} />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">课程表现刻度</p>
          <Badge className={`rounded-full hover:bg-inherit ${distributionTone(entry.totalScore)}`}>{entry.totalScore} 分</Badge>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(100, Math.max(0, Number(entry.totalScore)))}%` }} />
        </div>
      </div>
    </div>
  )
}

function CourseGradeAssignmentList({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-medium text-slate-900">作业明细</p>
      <div className="mt-3 space-y-2">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>{assignment.title}</span>
            <span>{assignment.score ?? '待批改'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CourseGradeQuizList({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-medium text-slate-900">测验明细</p>
      <div className="mt-3 space-y-2">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <div>
              <span>{quiz.title}</span>
              {quiz.subjectiveQuestionCount > 0 ? (
                <p className="text-xs text-slate-400">
                  客观题 {quiz.objectiveScore ?? quiz.score ?? 0}
                  {quiz.subjectiveScore !== undefined ? ` / 主观题 ${quiz.subjectiveScore}` : ' / 主观题待批改'}
                </p>
              ) : null}
            </div>
            <span>{quiz.score ?? '未提交'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
