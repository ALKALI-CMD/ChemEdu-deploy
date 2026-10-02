import { Card, CardContent } from '@/components/ui/UiComponents'
import { EmptyIllustrationState } from '@/components/education/VisualStates'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { UserId } from '@/objects/auth/UserId'
import type { Course } from '@/objects/course/catalog/Course'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import TeacherDiscussionCourseCard from './components/TeacherDiscussionCourseCard'
import TeacherDiscussionHeader from './components/TeacherDiscussionHeader'
import { useTeacherDiscussionFilters } from './hooks/useTeacherDiscussionFilters'

type TeacherDiscussionPanelProps = {
  courses: Course[]
  discussions: DiscussionTopic[]
  currentUserId: UserId
  onModerateTopic: (
    topicId: string,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
  ) => Promise<void>
}

export default function TeacherDiscussionPanel({
  courses,
  discussions,
  currentUserId,
  onModerateTopic,
}: TeacherDiscussionPanelProps) {
  const {
    selectedCourseId,
    setSelectedCourseId,
    discussionFilter,
    setDiscussionFilter,
    keyword,
    setKeyword,
    discussionByCourse,
  } = useTeacherDiscussionFilters({
    courses,
    discussions,
    currentUserId,
  })

  return (
    <div className="grid gap-6">
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <TeacherDiscussionHeader
          courses={courses}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          discussionFilter={discussionFilter}
          setDiscussionFilter={setDiscussionFilter}
          keyword={keyword}
          setKeyword={setKeyword}
        />

        <CardContent className="grid gap-4 xl:grid-cols-2">
          {discussionByCourse.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyIllustrationState
                kind="discussion"
                title="暂无讨论主题"
                message="当前筛选条件下没有需要治理的讨论主题，可以切换课程或状态继续查看。"
              />
            </div>
          ) : null}
          {discussionByCourse.map(({ course, topics, totalTopics, hiddenTopics, lockedTopics, pinnedTopics, myTopics }) => (
            <TeacherDiscussionCourseCard
              key={course.id}
              course={course}
              topics={topics}
              totalTopics={totalTopics}
              hiddenTopics={hiddenTopics}
              lockedTopics={lockedTopics}
              pinnedTopics={pinnedTopics}
              myTopics={myTopics}
              onModerateTopic={onModerateTopic}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
