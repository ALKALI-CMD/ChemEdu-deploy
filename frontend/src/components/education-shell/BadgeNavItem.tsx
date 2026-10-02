import { NavLink } from 'react-router-dom'
import type { ShellNavItem, ShellPrimaryNavItem } from './navigation'
type BadgeNavItemProps = {
  item: ShellNavItem
  badgeCount?: number
  variant: 'primary' | 'secondary'
}

function isPrimaryItem(item: ShellNavItem | ShellPrimaryNavItem): item is ShellPrimaryNavItem {
  return 'icon' in item
}

export default function BadgeNavItem({ item, badgeCount, variant }: BadgeNavItemProps) {
  return (
    <NavLink
      to={item.to}
      end={item.end ?? (variant === 'secondary')}
      className={({ isActive }) =>
        variant === 'primary'
          ? `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
              isActive
                ? 'border-[var(--primary)] bg-[var(--primary)] !text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]'
                : 'border-slate-200 bg-white !text-slate-900 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:!text-[var(--primary-strong)]'
            }`
          : `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive ? 'bg-sky-100 text-sky-900' : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`
      }
    >
      {isPrimaryItem(item) ? <item.icon className="h-4 w-4 shrink-0" /> : null}
      <span>{item.label}</span>
      {badgeCount ? (
        <span
          className={
            variant === 'primary'
              ? 'inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-semibold text-current'
              : 'inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-semibold text-[var(--primary-foreground)]'
          }
        >
          {badgeCount}
        </span>
      ) : null}
    </NavLink>
  )
}
