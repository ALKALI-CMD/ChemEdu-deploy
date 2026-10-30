import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FlaskConical, Menu, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/components/auth-context'
import { getPrimaryNavByRole, type ShellNavItem } from './education-shell/navigation'
import PreferenceButton from './education-shell/PreferenceButton'
import SecondaryNav from './education-shell/SecondaryNav'
import UserMenu from './education-shell/UserMenu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet'

type EducationShellProps = {
  eyebrow?: string
  title: string
  description: string
  secondaryNav?: ShellNavItem[]
  navCounts?: Record<string, number | undefined>
  children: ReactNode
}

export default function EducationShell({ eyebrow = '学习与探索', title, description, secondaryNav = [], navCounts, children }: EducationShellProps) {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const primaryNav = getPrimaryNavByRole(session?.user.role)
  const navigation = <nav aria-label="平台导航" className="workspace-nav">{primaryNav.map(({ icon: Icon, ...item }) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{item.label}</span>{!!navCounts?.[item.to] && <small>{navCounts[item.to]}</small>}</NavLink>)}</nav>
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#workspace-main">跳到主要内容</a>
      <aside className="workspace-sidebar">
        <Link to="/" className="workspace-brand"><FlaskConical size={24} /><span>清北营<small>CHEMISTRY OLYMPIAD</small></span></Link>
        <p className="sidebar-label">WORKSPACE / 工作空间</p>{navigation}
        <Link to="/" className="sidebar-home">访问官网 <ArrowUpRight size={15} /></Link>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className="workspace-menu" aria-label="打开导航"><Menu size={20} /></button></SheetTrigger><SheetContent side="left" aria-describedby={undefined} className="overflow-y-auto"><SheetTitle>清北营 · 工作空间</SheetTitle>{navigation}</SheetContent></Sheet>
            <span className="text-sm text-muted-foreground">清北营 <span className="mx-2 opacity-40">/</span> {title}</span>
          </div>
          <div className="flex items-center gap-3"><PreferenceButton /><UserMenu /></div>
        </header>
        <main id="workspace-main" className="workspace-main" tabIndex={-1}>
          <div className="workspace-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="workspace-description">{description}</p>}</div>
          <SecondaryNav items={secondaryNav} navCounts={navCounts} />
          <div className="workspace-content">{children}</div>
        </main>
      </div>
    </div>
  )
}
