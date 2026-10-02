import type { UserId } from '@/objects/auth/UserId'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

type DiscussionFilter = 'all' | 'hidden' | 'locked' | 'pinned' | 'mine'

function matchesDiscussionFilter(topic: DiscussionTopic, filter: DiscussionFilter, currentUserId: UserId) {
  switch (filter) {
    case 'hidden':
      return topic.visibility === DiscussionVisibility.Hidden
    case 'locked':
      return topic.threadState === DiscussionThreadState.Locked
    case 'pinned':
      return topic.pinState === DiscussionPinState.Pinned
    case 'mine':
      return topic.authorId === currentUserId
    default:
      return true
  }
}

export { matchesDiscussionFilter }
export type { DiscussionFilter }
