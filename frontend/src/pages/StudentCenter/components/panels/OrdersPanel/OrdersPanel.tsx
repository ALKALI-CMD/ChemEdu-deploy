import { CreditCard, ReceiptText } from 'lucide-react'
import type { Order } from '@/objects/admin/Order'
import { paymentMethodLabels, paymentMethods } from '@/lib/paymentMethods'
import type { PaymentMethod } from '@/lib/paymentMethods'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

const orderStatusLabel: Record<string, string> = {
  paid: '???',
  pending: '???',
  refunded: '???',
}

function paymentMethodLabel(paymentMethod?: string) {
  return paymentMethods.includes(paymentMethod as PaymentMethod)
    ? paymentMethodLabels[paymentMethod as PaymentMethod]
    : paymentMethod ?? '无'
}

export default function StudentOrdersPanel({ orders }: { orders: Order[] }) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <ReceiptText className="size-5 text-slate-600" />
            订单记录
          </CardTitle>
          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{orders.length} 条</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            当前还没有订单记录。报名付费课程后，订单会显示在这里。
          </div>
        ) : null}
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{zh(order.courseTitle)}</p>
                <p className="mt-1 text-xs text-slate-500">{order.id}</p>
              </div>
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                {orderStatusLabel[order.status]}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <OrderField label="实付金额" value={`￥${order.amount}`} strong />
              <OrderField label="优惠金额" value={`￥${order.discountAmount}`} />
              <OrderField label="支付方式" value={paymentMethodLabel(order.paymentMethod)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <CreditCard className="size-3.5" />
              <span>支付时间：{zh(order.paidAt)}</span>
              <span>支付状态：{order.paymentState}</span>
              <span>发票：{order.invoiceStatus ?? '未申请'}</span>
              <span>退款：{order.refundStatus ?? '无'}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function OrderField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 ${strong ? 'font-semibold text-slate-950' : 'text-slate-700'}`}>{value}</p>
    </div>
  )
}
