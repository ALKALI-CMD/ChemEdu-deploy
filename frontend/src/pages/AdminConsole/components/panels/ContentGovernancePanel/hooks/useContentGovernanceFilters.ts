import { useMemo, useState } from 'react'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

type GovernanceFilter = 'all' | 'visible' | 'hidden' | 'locked' | 'pinned'

function useContentGovernanceFilters(discussions: DiscussionTopic[]) {
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<GovernanceFilter>('all')

  const filteredDiscussions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return discussions.filter((discussion) => {
      if (filter === 'visible' && discussion.visibility !== DiscussionVisibility.Visible) return false
      if (filter === 'hidden' && discussion.visibility !== DiscussionVisibility.Hidden) return false
      if (filter === 'locked' && discussion.threadState !== DiscussionThreadState.Locked) return false
      if (filter === 'pinned' && discussion.pinState !== DiscussionPinState.Pinned) return false
      if (!normalizedKeyword) return true
      const searchable = `${discussion.title} ${discussion.author} ${discussion.content}`.toLowerCase()
      return searchable.includes(normalizedKeyword)
    })
  }, [discussions, filter, keyword])

  return { keyword, setKeyword, filter, setFilter, filteredDiscussions }
}

export { useContentGovernanceFilters }
export type { GovernanceFilter }
