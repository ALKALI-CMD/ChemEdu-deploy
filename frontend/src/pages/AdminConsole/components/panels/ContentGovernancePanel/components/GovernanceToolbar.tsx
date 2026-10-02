import { Button, Input } from '@/components/ui/UiComponents'
import type { GovernanceFilter } from '../hooks/useContentGovernanceFilters'

type GovernanceToolbarProps = {
  keyword: string
  setKeyword: (value: string) => void
  filter: GovernanceFilter
  setFilter: (value: GovernanceFilter) => void
}

const options: Array<{ value: GovernanceFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'visible', label: '显示中' },
  { value: 'hidden', label: '已隐藏' },
  { value: 'locked', label: '已锁帖' },
  { value: 'pinned', label: '已置顶' },
]

export default function GovernanceToolbar({ keyword, setKeyword, filter, setFilter }: GovernanceToolbarProps) {
  return (
    <>
      <Input
        className="bg-white"
        placeholder="搜索讨论标题、作者或内容"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            className={
              filter === value
                ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
            }
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </>
  )
}
