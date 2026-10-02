import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'

type AdminPanelShellProps = {
  title: string
  description: string
  headerExtras?: ReactNode
  children: ReactNode
}

export default function AdminPanelShell({ title, headerExtras, children }: AdminPanelShellProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-slate-950">{title}</CardTitle>
        </div>
        {headerExtras}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
