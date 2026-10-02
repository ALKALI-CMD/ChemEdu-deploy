import { Link } from 'react-router-dom'
import type { Assignment } from '@/objects/course/learning/Assignment'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import { Badge } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'
import { isDeadlinePassed } from '../functions/assignmentPanelModel'

type AssignmentSummaryLinkProps = {
  assignment: Assignment
}

export default function AssignmentSummaryLink({ assignment }: AssignmentSummaryLinkProps) {
  const completed = assignment.submissionStatus !== SubmissionStatus.Pending
  const reviewed = assignment.submissionStatus === SubmissionStatus.Reviewed
  const deadlinePassed = isDeadlinePassed(String(assignment.deadline))

  return (
    <Link
      to={`/student/assignments/${assignment.id}`}
      className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">{zh(assignment.title)}</p>
          <p className="mt-1 text-sm text-slate-500">截止时间：{assignment.deadline}</p>
        </div>
        <Badge className={completed ? 'rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100' : 'rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100'}>
          {completed ? '已完成' : '未完成'}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className={reviewed ? 'rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100' : 'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100'}>
          {reviewed ? '已批改' : '未批改'}
        </Badge>
        <Badge className={deadlinePassed ? 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100' : 'rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-50'}>
          {deadlinePassed ? '已截止' : '未截止'}
        </Badge>
        <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">
          {assignment.allowResubmission ? '教师允许重交' : '教师设为单次提交'}
        </Badge>
      </div>
    </Link>
  )
}
