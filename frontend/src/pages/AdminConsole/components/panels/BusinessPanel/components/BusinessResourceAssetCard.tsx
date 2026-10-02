import { Download, FileText, Upload } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import { findBusinessCourse } from '../functions/businessPanelModel'

type BusinessResourceAssetCardProps = {
  dashboard: EducationDashboardResponse
}

export default function BusinessResourceAssetCard({ dashboard }: BusinessResourceAssetCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <FileText className="h-5 w-5 text-slate-600" />
            内容资源服务
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            上传资源
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dashboard.resourceAssets.map((asset) => {
          const course = findBusinessCourse(dashboard.courses, asset.courseId)
          return (
            <div key={asset.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{asset.filename}</p>
                  <p className="mt-1 text-sm text-slate-500">{course ? zh(course.title) : asset.courseId} · v{asset.version} · {asset.visibility}</p>
                  <p className="mt-1 text-xs text-slate-500">{asset.storageKey}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  权限下载
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>预览：{asset.previewUrl}</span>
                <span>更新：{zh(asset.updatedAt)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
