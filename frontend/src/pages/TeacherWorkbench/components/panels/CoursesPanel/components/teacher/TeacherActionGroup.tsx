import type { ReactNode } from 'react'

export default function TeacherActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
