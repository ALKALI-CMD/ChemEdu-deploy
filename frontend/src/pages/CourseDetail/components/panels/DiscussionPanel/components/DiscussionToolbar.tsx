import { Button, Input } from '@/components/ui/UiComponents'
import type { DiscussionSortMode, ResolutionFilter, ThreadFilter, VisibilityFilter } from '../hooks/useDiscussionBoardState'

type DiscussionToolbarProps = {
  canModerate: boolean
  canPost: boolean
  lessonOptions: Array<{ id: string; title: string }>
  searchKeyword: string
  threadFilter: ThreadFilter
  visibilityFilter: VisibilityFilter
  resolutionFilter: ResolutionFilter
  sortMode: DiscussionSortMode
  lessonFilter: string
  showComposer: boolean
  onSearchKeywordChange: (value: string) => void
  onThreadFilterChange: (value: ThreadFilter) => void
  onVisibilityFilterChange: (value: VisibilityFilter) => void
  onResolutionFilterChange: (value: ResolutionFilter) => void
  onSortModeChange: (value: DiscussionSortMode) => void
  onLessonFilterChange: (value: string) => void
  onComposerToggle: () => void
}

export default function DiscussionToolbar({
  canModerate,
  canPost,
  lessonOptions,
  searchKeyword,
  threadFilter,
  visibilityFilter,
  resolutionFilter,
  sortMode,
  lessonFilter,
  showComposer,
  onSearchKeywordChange,
  onThreadFilterChange,
  onVisibilityFilterChange,
  onResolutionFilterChange,
  onSortModeChange,
  onLessonFilterChange,
  onComposerToggle,
}: DiscussionToolbarProps) {
  return (
    <div className="sticky top-0 z-10 space-y-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Input
          className="max-w-xl bg-white"
          placeholder="搜索主题、作者、回复内容或教师总结"
          value={searchKeyword}
          onChange={(event) => onSearchKeywordChange(event.target.value)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            value={lessonFilter}
            onChange={(event) => onLessonFilterChange(event.target.value)}
          >
            <option value="all">全部课时</option>
            <option value="general">课程整体</option>
            {lessonOptions.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>

          <select
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            value={threadFilter}
            onChange={(event) => onThreadFilterChange(event.target.value as ThreadFilter)}
          >
            <option value="all">全部主题</option>
            <option value="open">仅看可回复</option>
            <option value="locked">仅看已锁帖</option>
          </select>

          <select
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            value={resolutionFilter}
            onChange={(event) => onResolutionFilterChange(event.target.value as ResolutionFilter)}
          >
            <option value="all">全部状态</option>
            <option value="unresolved">仅看未解决</option>
            <option value="resolved">仅看已解决</option>
          </select>

          <select
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as DiscussionSortMode)}
          >
            <option value="latest">按最新回复</option>
            <option value="hot">按热度</option>
          </select>

          {canModerate ? (
            <select
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              value={visibilityFilter}
              onChange={(event) => onVisibilityFilterChange(event.target.value as VisibilityFilter)}
            >
              <option value="all">全部可见性</option>
              <option value="visible">仅看显示中</option>
              <option value="hidden">仅看已隐藏</option>
            </select>
          ) : null}

          {canPost ? (
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={onComposerToggle}>
              {showComposer ? '收起发帖区' : '发起讨论'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
