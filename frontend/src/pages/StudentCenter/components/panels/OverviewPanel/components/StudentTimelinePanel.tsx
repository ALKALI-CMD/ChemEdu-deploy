import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent } from '@/components/ui/UiComponents'
import type { Assignment } from '@/objects/course/learning/Assignment'
import type { Quiz } from '@/objects/course/learning/Quiz'
import { QuizStatus } from '@/objects/course/learning/QuizStatus'
import type { TimelineItem } from '../../../../hooks/useStudentCenterModel'

type StudentTimelinePanelProps = {
  prioritizedAssignments: Assignment[]
  prioritizedQuizzes: Quiz[]
  groupedTimeline: Record<string, TimelineItem[]>
  courseTitleMap: Map<string, string>
}

export default function StudentTimelinePanel({
  prioritizedAssignments,
  prioritizedQuizzes,
  groupedTimeline,
  courseTitleMap,
}: StudentTimelinePanelProps) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">任务时间线</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {[...prioritizedAssignments.slice(0, 3), ...prioritizedQuizzes.slice(0, 2)]
              .slice(0, 4)
              .map((item) => {
                const isAssignment = 'deadline' in item
                return (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{String(item.title)}</p>
                      <Badge
                        className={
                          isAssignment
                            ? 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100'
                            : 'rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100'
                        }
                      >
                        {isAssignment ? '作业' : '测验'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{courseTitleMap.get(item.courseId) ?? '课程任务'}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {isAssignment
                        ? `截止时间：${item.deadline}`
                        : item.status === QuizStatus.Ongoing
                          ? '状态：进行中'
                          : item.status === QuizStatus.Upcoming
                            ? '状态：即将开始'
                            : '状态：已结束'}
                    </p>
                  </div>
                )
              })}

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/student/assignments">查看作业</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
                <Link to="/student/quizzes">查看测验</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-950">统一时间线</p>
            {Object.entries(groupedTimeline).map(([groupLabel, items]) => (
              <div key={groupLabel} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium tracking-[0.2em] text-slate-500">{groupLabel}</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                {items.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={
                              item.category === 'assignment'
                                ? 'rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100'
                                : item.category === 'quiz'
                                  ? 'rounded-full bg-sky-100 text-sky-900 hover:bg-sky-100'
                                  : 'rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100'
                            }
                          >
                            {item.category === 'assignment' ? '作业' : item.category === 'quiz' ? '测验' : '课程'}
                          </Badge>
                          <p className="font-medium text-slate-950">{item.title}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{item.status}</span>
                          <span>{item.timestampLabel}</span>
                        </div>
                      </div>

                      {item.category === 'assignment' && item.assignmentId ? (
                        <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
                          <Link to={`/student/assignments?assignment=${encodeURIComponent(item.assignmentId)}`}>打开作业</Link>
                        </Button>
                      ) : null}

                      {item.category === 'quiz' && item.quizId ? (
                        <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
                          <Link to={`/student/quizzes?quiz=${encodeURIComponent(item.quizId)}`}>打开测验</Link>
                        </Button>
                      ) : null}

                      {item.category === 'course' && item.courseId ? (
                        <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white hover:bg-slate-100">
                          <Link
                            to={
                              item.lessonId
                                ? `/course/${item.courseId}?lesson=${encodeURIComponent(item.lessonId)}`
                                : `/course/${item.courseId}`
                            }
                          >
                            继续学习
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
