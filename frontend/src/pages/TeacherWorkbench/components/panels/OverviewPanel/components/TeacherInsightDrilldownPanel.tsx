import { Link } from 'react-router-dom'
import { Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { buildLessonLink, text, type DrilldownKey } from '../functions/teacherOverviewModel'

type TeacherInsightDrilldownPanelProps = {
  insights: EducationDashboardResponse['teachingInsights']
  activeDrilldown: DrilldownKey
  onDrilldownChange: (value: DrilldownKey) => void
}

export default function TeacherInsightDrilldownPanel({
  insights,
  activeDrilldown,
  onDrilldownChange,
}: TeacherInsightDrilldownPanelProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-950">点击下钻视图</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={activeDrilldown === 'risk' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('risk')}>
              掉队学生
            </Button>
            <Button type="button" variant={activeDrilldown === 'bottleneck' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('bottleneck')}>
              课时卡点
            </Button>
            <Button type="button" variant={activeDrilldown === 'hotspot' ? 'default' : 'outline'} className="rounded-full" onClick={() => onDrilldownChange('hotspot')}>
              高错题
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {activeDrilldown === 'risk'
            ? insights.atRiskStudents.map((student) => (
                <Link
                  key={`drill-risk-${student.courseId}-${student.userId}`}
                  to={`/course/${student.courseId}/manage`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{text(student.studentName)}</p>
                      <p className="text-sm text-slate-500">{text(student.courseTitle)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">进度 {student.completionRate}%</span>
                      <span className="rounded-full bg-white px-3 py-1">学习 {student.studyMinutes} 分钟</span>
                      <span className="rounded-full bg-white px-3 py-1">均分 {student.averageScore}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{student.riskReasons.join('、')}</p>
                </Link>
              ))
            : null}

          {activeDrilldown === 'bottleneck'
            ? insights.lessonBottlenecks.map((lesson) => (
                <Link
                  key={`drill-bottleneck-${lesson.lessonId}`}
                  to={buildLessonLink(lesson.courseId, lesson.lessonId)}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{text(lesson.lessonTitle)}</p>
                      <p className="text-sm text-slate-500">
                        {text(lesson.courseTitle)} / {text(lesson.moduleTitle)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">完成率 {lesson.completionRate}%</span>
                      <span className="rounded-full bg-white px-3 py-1">
                        {lesson.completedStudentCount} / {lesson.enrolledStudentCount}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    平均学习 {lesson.averageStudyMinutes} 分钟，建议学习时长 {lesson.requiredStudyMinutes} 分钟。
                  </p>
                </Link>
              ))
            : null}

          {activeDrilldown === 'hotspot'
            ? insights.questionHotspots.map((question) => (
                <Link
                  key={`drill-hotspot-${question.questionId}`}
                  to="/teacher/gradebook"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{text(question.questionPrompt)}</p>
                      <p className="text-sm text-slate-500">
                        {text(question.courseTitle)} / {text(question.quizTitle)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">{text(question.questionType)}</span>
                      <span className="rounded-full bg-white px-3 py-1">错误率 {question.wrongRate}%</span>
                      <span className="rounded-full bg-white px-3 py-1">
                        {question.wrongCount} / {question.attemptCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            : null}
        </div>
      </CardContent>
    </Card>
  )
}
