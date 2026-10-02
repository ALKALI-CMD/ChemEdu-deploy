import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/UiComponents'
import type { CourseProgressStats } from '@/objects/course/learning/CourseProgressStats'
import type { GradebookEntry } from '@/objects/course/learning/GradebookEntry'
import { distributionTone } from '../functions/gradebookUtils'

type CourseGradeEntryListProps = {
  selectedGradeEntry: GradebookEntry
  gradebookEntries: GradebookEntry[]
  courseProgressEntries: CourseProgressStats[]
  courseTitleMap: Map<string, string>
}

export default function CourseGradeEntryList({
  selectedGradeEntry,
  gradebookEntries,
  courseProgressEntries,
  courseTitleMap,
}: CourseGradeEntryListProps) {
  return (
    <div className="space-y-3">
      {gradebookEntries.map((entry) => {
        const selected = selectedGradeEntry.courseId === entry.courseId
        const progress = courseProgressEntries.find((item) => item.courseId === entry.courseId)

        return (
          <Link
            key={entry.courseId}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              selected ? 'block border-sky-300 bg-sky-50 shadow-sm' : 'block border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
            }`}
            to={`/teacher/gradebook/course/${entry.courseId}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{courseTitleMap.get(entry.courseId) ?? entry.courseTitle}</p>
                <p className="mt-1 text-sm text-slate-500">
                  完成 {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0} 课时
                </p>
              </div>
              <Badge className={`rounded-full hover:bg-inherit ${distributionTone(entry.totalScore)}`}>{entry.totalScore} 分</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <span>作业均分 {entry.assignmentAverage}</span>
              <span>测验均分 {entry.quizAverage}</span>
              <span>进度得分 {entry.progressScore}</span>
              <span>完成率 {entry.completedTaskRate}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
