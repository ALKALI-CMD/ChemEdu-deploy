import { ChartPanel, SimpleBarChart, type BarDatum } from '@/components/education/EducationCharts'
import { SubmissionStatus } from '@/objects/course/learning/SubmissionStatus'
import type { Assignment } from '@/objects/course/learning/Assignment'

type TeacherAssignmentStatusChartProps = {
  assignments: Assignment[]
}

export default function TeacherAssignmentStatusChart({ assignments }: TeacherAssignmentStatusChartProps) {
  const data: BarDatum[] = [
    {
      label: '待提交',
      value: assignments.filter((assignment) => assignment.submissionStatus === SubmissionStatus.Pending).length,
      fill: '#64748b',
    },
    {
      label: '待批改',
      value: assignments.filter((assignment) => assignment.submissionStatus === SubmissionStatus.Submitted).length,
      fill: '#f59e0b',
    },
    {
      label: '已批改',
      value: assignments.filter((assignment) => assignment.submissionStatus === SubmissionStatus.Reviewed).length,
      fill: '#10b981',
    },
  ]

  return (
    <ChartPanel title="作业提交状态" description="按提交状态拆分当前教师工作台中的作业记录，优先暴露待批改压力。">
      <SimpleBarChart data={data} />
    </ChartPanel>
  )
}
