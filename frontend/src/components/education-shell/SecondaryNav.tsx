import type { ShellNavItem } from './navigation'
import BadgeNavItem from './BadgeNavItem'

type SecondaryNavProps = {
  items: ShellNavItem[]
  navCounts?: Record<string, number | undefined>
}

export default function SecondaryNav({ items, navCounts }: SecondaryNavProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="二级导航"
      className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-4"
    >
      {items.map((item) => {
        const count = navCounts?.[item.to]
        return (
          <BadgeNavItem key={item.to} item={item} badgeCount={count && count > 0 ? count : undefined} variant="secondary" />
        )
      })}
    </nav>
  )
}
