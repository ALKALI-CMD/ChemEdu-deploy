import DiscussionPagination from './DiscussionPagination'
import DiscussionToolbar from './DiscussionToolbar'
import type { useDiscussionBoardState } from '../hooks/useDiscussionBoardState'

type DiscussionBoardToolbarSectionProps = {
  canPost: boolean
  canModerate: boolean
  lessonOptions: Array<{ id: string; title: string }>
  boardState: ReturnType<typeof useDiscussionBoardState>
}

export default function DiscussionBoardToolbarSection({
  canPost,
  canModerate,
  lessonOptions,
  boardState,
}: DiscussionBoardToolbarSectionProps) {
  return (
    <>
      <DiscussionToolbar
        canModerate={canModerate}
        canPost={canPost}
        lessonOptions={lessonOptions}
        searchKeyword={boardState.searchKeyword}
        threadFilter={boardState.threadFilter}
        visibilityFilter={boardState.visibilityFilter}
        resolutionFilter={boardState.resolutionFilter}
        sortMode={boardState.sortMode}
        lessonFilter={boardState.lessonFilter}
        showComposer={boardState.showComposer}
        onSearchKeywordChange={(value) => {
          boardState.setSearchKeyword(value)
          boardState.setPage(1)
        }}
        onLessonFilterChange={(value) => {
          boardState.setLessonFilter(value)
          boardState.setPage(1)
        }}
        onThreadFilterChange={(value) => {
          boardState.setThreadFilter(value)
          boardState.setPage(1)
        }}
        onVisibilityFilterChange={(value) => {
          boardState.setVisibilityFilter(value)
          boardState.setPage(1)
        }}
        onResolutionFilterChange={(value) => {
          boardState.setResolutionFilter(value)
          boardState.setPage(1)
        }}
        onSortModeChange={boardState.setSortMode}
        onComposerToggle={() => boardState.setShowComposer((current) => !current)}
      />

      <DiscussionPagination
        currentPage={boardState.currentPage}
        totalPages={boardState.totalPages}
        totalCount={boardState.filteredCount}
        onPrev={() => boardState.setPage((current) => Math.max(1, current - 1))}
        onNext={() => boardState.setPage((current) => Math.min(boardState.totalPages, current + 1))}
      />
    </>
  )
}
