import type { ReactNode } from 'react'

export default function AdminActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
