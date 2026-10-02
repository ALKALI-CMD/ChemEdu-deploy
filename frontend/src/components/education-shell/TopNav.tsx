import type { ShellPrimaryNavItem } from './navigation'
import BadgeNavItem from './BadgeNavItem'

type TopNavProps = {
  items: ShellPrimaryNavItem[]
  navCounts?: Record<string, number | undefined>
}

export default function TopNav({ items, navCounts }: TopNavProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="一级导航" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const count = navCounts?.[item.to]
        return (
          <BadgeNavItem key={item.to} item={item} badgeCount={count && count > 0 ? count : undefined} variant="primary" />
        )
      })}
    </nav>
  )
}
