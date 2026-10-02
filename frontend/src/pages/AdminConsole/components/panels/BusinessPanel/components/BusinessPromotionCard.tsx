import { Sparkles } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { formatMoney } from '../functions/businessPanelModel'

type BusinessPromotionCardProps = {
  coupons: EducationDashboardResponse['coupons']
  promotions: EducationDashboardResponse['promotions']
}

export default function BusinessPromotionCard({ coupons, promotions }: BusinessPromotionCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Sparkles className="h-5 w-5 text-slate-600" />
          优惠与促销
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-950">{coupon.title}</p>
              <Badge variant={coupon.active ? 'default' : 'secondary'}>{coupon.active ? '启用' : '停用'}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{coupon.code} · 满 {formatMoney(coupon.minAmount)} 减 {formatMoney(coupon.discountAmount)}</p>
          </div>
        ))}
        {promotions.map((promotion) => (
          <div key={promotion.id} className="rounded-lg border border-slate-200 p-3">
            <p className="font-medium text-slate-950">{promotion.title}</p>
            <p className="mt-1 text-sm text-slate-500">{promotion.discountPercent}% · {promotion.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
