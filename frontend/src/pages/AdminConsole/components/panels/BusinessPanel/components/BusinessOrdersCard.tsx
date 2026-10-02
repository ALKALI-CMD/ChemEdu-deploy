import { Receipt } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { zh } from '@/lib/localization'
import { formatMoney, invoiceStatusLabel, paymentMethodLabel, paymentStateLabel } from '../functions/businessPanelModel'

type BusinessOrdersCardProps = {
  orders: EducationDashboardResponse['orders']
}

export default function BusinessOrdersCard({ orders }: BusinessOrdersCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Receipt className="h-5 w-5 text-slate-600" />
          支付与订单
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">{zh(order.courseTitle)}</p>
                <p className="mt-1 text-xs text-slate-500">{order.id} · {zh(order.buyer)}</p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                {paymentStateLabel[order.paymentState] ?? order.paymentState}
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-4">
              <span>实付 {formatMoney(order.amount)}</span>
              <span>优惠 {formatMoney(order.discountAmount)}</span>
              <span>支付 {paymentMethodLabel(order.paymentMethod)}</span>
              <span>发票 {invoiceStatusLabel[order.invoiceStatus ?? ''] ?? order.invoiceStatus ?? '未申请'}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
