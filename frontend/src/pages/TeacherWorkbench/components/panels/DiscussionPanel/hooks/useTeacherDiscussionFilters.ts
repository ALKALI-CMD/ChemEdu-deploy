import { useMemo, useState } from 'react'
import type { UserId } from '@/objects/auth/UserId'
import type { Course } from '@/objects/course/catalog/Course'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import { matchesDiscussionFilter, type DiscussionFilter } from '../functions/teacherDiscussionUtils'

function useTeacherDiscussionFilters({
  courses,
  discussions,
  currentUserId,
}: {
  courses: Course[]
  discussions: DiscussionTopic[]
  currentUserId: UserId
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [discussionFilter, setDiscussionFilter] = useState<DiscussionFilter>('all')
  const [keyword, setKeyword] = useState('')

  const discussionByCourse = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return courses
      .map((course) => {
        const courseTopics = discussions.filter((topic) => topic.courseId === course.id)
        const filteredTopics = courseTopics.filter((topic) => {
          if (!matchesDiscussionFilter(topic, discussionFilter, currentUserId)) return false
          if (!normalizedKeyword) return true

          const searchable = `${topic.title} ${topic.author} ${topic.content}`.toLowerCase()
          return searchable.includes(normalizedKeyword)
        })

        return {
          course,
          topics: filteredTopics,
          totalTopics: courseTopics.length,
          hiddenTopics: courseTopics.filter((topic) => topic.visibility === DiscussionVisibility.Hidden).length,
          lockedTopics: courseTopics.filter((topic) => topic.threadState === DiscussionThreadState.Locked).length,
          pinnedTopics: courseTopics.filter((topic) => topic.pinState === DiscussionPinState.Pinned).length,
          myTopics: courseTopics.filter((topic) => topic.authorId === currentUserId).length,
        }
      })
      .filter((item) => (selectedCourseId === 'all' ? true : item.course.id === selectedCourseId))
  }, [courses, currentUserId, selectedCourseId, discussions, discussionFilter, keyword])

  return {
    selectedCourseId,
    setSelectedCourseId,
    discussionFilter,
    setDiscussionFilter,
    keyword,
    setKeyword,
    discussionByCourse,
  }
}

export { useTeacherDiscussionFilters }
