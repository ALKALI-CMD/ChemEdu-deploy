import { useEffect, useMemo, useState } from 'react'
import { DiscussionPinState } from '@/objects/course/discussion/DiscussionPinState'
import { DiscussionThreadState } from '@/objects/course/discussion/DiscussionThreadState'
import { DiscussionVisibility } from '@/objects/course/discussion/DiscussionVisibility'
import type { UserId } from '@/objects/auth/UserId'
import type { DiscussionReply } from '@/objects/course/discussion/DiscussionReply'
import type { DiscussionTopic } from '@/objects/course/discussion/DiscussionTopic'

const PAGE_SIZE = 5

export type ThreadFilter = 'all' | 'open' | 'locked'
export type VisibilityFilter = 'all' | 'visible' | 'hidden'
export type ResolutionFilter = 'all' | 'resolved' | 'unresolved'
export type DiscussionSortMode = 'latest' | 'hot'

export function useDiscussionBoardState(
  discussions: DiscussionTopic[],
  currentUserId: UserId,
  canPost: boolean,
  canModerate: boolean,
  focusLessonId?: string,
) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilter>('all')
  const [sortMode, setSortMode] = useState<DiscussionSortMode>('latest')
  const [lessonFilter, setLessonFilter] = useState<string>(focusLessonId ?? 'all')
  const [composerLessonId, setComposerLessonId] = useState<string>(focusLessonId ?? 'general')
  const [page, setPage] = useState(1)
  const [showComposer, setShowComposer] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTopicTitle, setEditingTopicTitle] = useState('')
  const [editingTopicContent, setEditingTopicContent] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editingReplyContent, setEditingReplyContent] = useState('')

  const filteredDiscussions = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    return [...discussions]
      .filter((discussion) => {
        if (threadFilter === 'open' && discussion.threadState !== DiscussionThreadState.Open) {
          return false
        }
        if (threadFilter === 'locked' && discussion.threadState !== DiscussionThreadState.Locked) {
          return false
        }
        if (visibilityFilter === 'visible' && discussion.visibility !== DiscussionVisibility.Visible) {
          return false
        }
        if (visibilityFilter === 'hidden' && discussion.visibility !== DiscussionVisibility.Hidden) {
          return false
        }
        if (resolutionFilter === 'resolved' && !discussion.resolved) {
          return false
        }
        if (resolutionFilter === 'unresolved' && discussion.resolved) {
          return false
        }
        if (lessonFilter === 'general' && discussion.lessonId) {
          return false
        }
        if (lessonFilter !== 'all' && lessonFilter !== 'general' && discussion.lessonId !== lessonFilter) {
          return false
        }
        if (!keyword) {
          return true
        }

        const replyText = discussion.replies.map((reply) => reply.content).join(' ')
        const teacherSummaryText = discussion.teacherHighlights.map((item) => item.content).join(' ')
        const searchable = `${discussion.title} ${discussion.author} ${discussion.content} ${discussion.lessonTitle ?? ''} ${replyText} ${teacherSummaryText}`.toLowerCase()
        return searchable.includes(keyword)
      })
      .sort((left, right) => {
        if (left.pinState !== right.pinState) {
          return left.pinState === DiscussionPinState.Pinned ? -1 : 1
        }
        if (sortMode === 'hot' && left.heatScore !== right.heatScore) {
          return right.heatScore - left.heatScore
        }
        if (left.resolved !== right.resolved) {
          return left.resolved ? 1 : -1
        }
        return Date.parse(right.lastReplyAt) - Date.parse(left.lastReplyAt)
      })
  }, [discussions, lessonFilter, resolutionFilter, searchKeyword, sortMode, threadFilter, visibilityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDiscussions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedDiscussions = useMemo(
    () => filteredDiscussions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, filteredDiscussions],
  )

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (!canPost) {
      setShowComposer(false)
    }
  }, [canPost])

  useEffect(() => {
    if (focusLessonId) {
      setLessonFilter(focusLessonId)
      setComposerLessonId(focusLessonId)
    }
  }, [focusLessonId])

  function startTopicEditing(topic: DiscussionTopic) {
    setEditingTopicId(topic.id)
    setEditingTopicTitle(topic.title)
    setEditingTopicContent(topic.content)
  }

  function cancelTopicEditing() {
    setEditingTopicId(null)
    setEditingTopicTitle('')
    setEditingTopicContent('')
  }

  function startReplyEditing(reply: DiscussionReply) {
    setEditingReplyId(reply.id)
    setEditingReplyContent(reply.content)
  }

  function cancelReplyEditing() {
    setEditingReplyId(null)
    setEditingReplyContent('')
  }

  function isOwnTopic(topic: DiscussionTopic) {
    return topic.authorId === currentUserId
  }

  function isOwnReply(reply: DiscussionReply) {
    return reply.authorId === currentUserId
  }

  function canReplyToTopic(topic: DiscussionTopic) {
    return canPost && (topic.threadState === DiscussionThreadState.Open || canModerate)
  }

  async function saveTopic(onUpdateTopic: (topicId: string, title: string, content: string) => Promise<void>) {
    if (!editingTopicId) {
      return
    }

    await onUpdateTopic(editingTopicId, editingTopicTitle, editingTopicContent)
    cancelTopicEditing()
  }

  async function saveReply(onUpdateReply: (replyId: string, content: string) => Promise<void>) {
    if (!editingReplyId) {
      return
    }

    await onUpdateReply(editingReplyId, editingReplyContent)
    cancelReplyEditing()
  }

  return {
    searchKeyword,
    setSearchKeyword,
    threadFilter,
    setThreadFilter,
    visibilityFilter,
    setVisibilityFilter,
    resolutionFilter,
    setResolutionFilter,
    sortMode,
    setSortMode,
    lessonFilter,
    setLessonFilter,
    composerLessonId,
    setComposerLessonId,
    currentPage,
    totalPages,
    setPage,
    showComposer,
    setShowComposer,
    pagedDiscussions,
    filteredCount: filteredDiscussions.length,
    editingTopicId,
    editingTopicTitle,
    setEditingTopicTitle,
    editingTopicContent,
    setEditingTopicContent,
    editingReplyId,
    editingReplyContent,
    setEditingReplyContent,
    startTopicEditing,
    cancelTopicEditing,
    startReplyEditing,
    cancelReplyEditing,
    isOwnTopic,
    isOwnReply,
    canReplyToTopic,
    saveTopic,
    saveReply,
  }
}
