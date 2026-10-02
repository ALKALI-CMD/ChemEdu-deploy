import type { ReactNode } from 'react'
import { useAuth } from '@/components/auth-context'
import type { ShellNavItem } from './education-shell/navigation'
import { getPrimaryNavByRole } from './education-shell/navigation'
import PreferenceButton from './education-shell/PreferenceButton'
import SecondaryNav from './education-shell/SecondaryNav'
import TopNav from './education-shell/TopNav'
import UserMenu from './education-shell/UserMenu'

type EducationShellProps = {
  eyebrow?: string
  title: string
  description: string
  secondaryNav?: ShellNavItem[]
  navCounts?: Record<string, number | undefined>
  children: ReactNode
}

export default function EducationShell({
  eyebrow = '清北营 · 化学竞赛训练与评定平台',
  title,
  secondaryNav = [],
  navCounts,
  children,
}: EducationShellProps) {
  const { session } = useAuth()
  const primaryNav = getPrimaryNavByRole(session?.user.role)

  return (
    <div className="layout-stacked min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <PreferenceButton />
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-[0.24em] text-slate-400">{eyebrow}</p>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
                  </div>
                </div>
              </div>
              <UserMenu />
            </div>

            <TopNav items={primaryNav} navCounts={navCounts} />
            <SecondaryNav items={secondaryNav} navCounts={navCounts} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
    </div>
  )
}
