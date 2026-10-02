import { Button } from '@/components/ui/UiComponents'

type DiscussionPaginationProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  onPrev: () => void
  onNext: () => void
}

export default function DiscussionPagination({
  currentPage,
  totalPages,
  totalCount,
  onPrev,
  onNext,
}: DiscussionPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <span>共 {totalCount} 个讨论主题</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onPrev} disabled={currentPage <= 1}>
          上一页
        </Button>
        <span>
          第 {currentPage} / {totalPages} 页
        </span>
        <Button type="button" variant="outline" className="rounded-full" onClick={onNext} disabled={currentPage >= totalPages}>
          下一页
        </Button>
      </div>
    </div>
  )
}
