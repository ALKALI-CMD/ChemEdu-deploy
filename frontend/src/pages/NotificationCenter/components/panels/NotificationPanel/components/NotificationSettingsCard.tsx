import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { categoryLabel } from '../functions/notificationPanelModel'

type NotificationSettingsCardProps = {
  visibleCategories: string[]
  settings: EducationDashboardResponse['notificationSettings']
  onUpdateSetting: (category: string, enabled: boolean) => void
}

export default function NotificationSettingsCard({
  visibleCategories,
  settings,
  onUpdateSetting,
}: NotificationSettingsCardProps) {
  const settingMap = new Map(settings.map((setting) => [setting.category, setting]))

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>通知设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleCategories.filter((item) => item !== 'all').map((item) => {
          const enabled = settingMap.get(item)?.enabled ?? true
          return (
            <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <span>{categoryLabel[item] ?? item}</span>
              <input type="checkbox" checked={enabled} onChange={(event) => onUpdateSetting(item, event.target.checked)} />
            </label>
          )
        })}
      </CardContent>
    </Card>
  )
}
