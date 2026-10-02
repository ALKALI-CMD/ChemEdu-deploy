import { Button, CardHeader, Input } from '@/components/ui/UiComponents'
import type { Course } from '@/objects/course/catalog/Course'
import type { DiscussionFilter } from '../functions/teacherDiscussionUtils'
import { zh } from '@/lib/localization'

type TeacherDiscussionHeaderProps = {
  courses: Course[]
  selectedCourseId: string
  setSelectedCourseId: (value: string) => void
  discussionFilter: DiscussionFilter
  setDiscussionFilter: (value: DiscussionFilter) => void
  keyword: string
  setKeyword: (value: string) => void
}

const filterOptions: Array<{ value: DiscussionFilter; label: string }> = [
  { value: 'all', label: '全部主题' },
  { value: 'hidden', label: '已隐藏' },
  { value: 'locked', label: '已锁帖' },
  { value: 'pinned', label: '已置顶' },
  { value: 'mine', label: '我发起的' },
]

export default function TeacherDiscussionHeader({
  courses,
  selectedCourseId,
  setSelectedCourseId,
  discussionFilter,
  setDiscussionFilter,
  keyword,
  setKeyword,
}: TeacherDiscussionHeaderProps) {
  return (
    <CardHeader className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-950">讨论管理</h3>
      </div>

      <Input
        className="bg-white"
        placeholder="搜索学生提问、回复内容或课程讨论关键词"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className={
            selectedCourseId === 'all'
              ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
              : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
          }
          onClick={() => setSelectedCourseId('all')}
        >
          全部课程
        </Button>
        {courses.map((course) => (
          <Button
            key={course.id}
            type="button"
            variant="outline"
            className={
              selectedCourseId === course.id
                ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
            }
            onClick={() => setSelectedCourseId(course.id)}
          >
            {zh(course.title)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            className={
              discussionFilter === value
                ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
            }
            onClick={() => setDiscussionFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </CardHeader>
  )
}
