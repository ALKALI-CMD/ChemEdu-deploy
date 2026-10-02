import { useEffect, useState } from 'react'
import { Check, CreditCard, Smartphone, Wallet } from 'lucide-react'
import type { Course } from '@/objects/course/catalog/Course'
import { Button, Input } from '@/components/ui/UiComponents'
import { ModalShell } from '@/components/ModalShell'
import { deductWalletBalance, readWalletBalance, rechargeWalletBalance, walletRechargeOptions } from '@/lib/wallet'
import { paymentMethodLabels, paymentMethods } from '@/lib/paymentMethods'
import type { PaymentMethod } from '@/lib/paymentMethods'

type PaymentConfirmDialogProps = {
  course: Course
  userId: string
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (paymentMethod?: PaymentMethod, inviteCode?: string) => Promise<void>
}

type CheckoutMode = 'wallet' | 'invite' | 'thirdParty'

const paymentMethodIcons: Record<PaymentMethod, typeof Wallet> = {
  wallet: Wallet,
  wechat_pay: Smartphone,
  alipay: CreditCard,
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

export default function PaymentConfirmDialog({
  course,
  userId,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: PaymentConfirmDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet')
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('wallet')
  const [inviteCode, setInviteCode] = useState('')
  const [walletBalance, setWalletBalance] = useState(() => readWalletBalance(userId))
  const [rechargeAmount, setRechargeAmount] = useState('100')
  const price = Number(course.price)
  const walletSelected = paymentMethod === 'wallet'
  const inviteSelected = checkoutMode === 'invite'
  const walletInsufficient = walletSelected && walletBalance < price

  useEffect(() => {
    if (!isOpen) return
    setWalletBalance(readWalletBalance(userId))
    setCheckoutMode('wallet')
    setPaymentMethod('wallet')
    setInviteCode('')
    setRechargeAmount('100')
  }, [isOpen, course.id, userId])

  function rechargeWallet(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return
    setWalletBalance((current) => rechargeWalletBalance(userId, current, amount))
  }

  async function handleConfirm() {
    if (checkoutMode === 'wallet' && walletInsufficient) return
    if (inviteSelected && !inviteCode.trim()) return

    await onConfirm(inviteSelected ? undefined : paymentMethod, inviteSelected ? inviteCode.trim() : undefined)

    if (checkoutMode === 'wallet') {
      setWalletBalance((current) => deductWalletBalance(userId, current, price))
    }
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5 text-slate-900 sm:min-w-[520px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">报名确认</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{text(course.title)}</h2>
          </div>
          <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs text-slate-500">应付金额</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">￥{price}</p>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">分类</p>
            <p className="mt-1 font-medium text-slate-900">{text(course.category)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">年级</p>
            <p className="mt-1 font-medium text-slate-900">{text(course.grade)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">上课安排</p>
            <p className="mt-1 font-medium text-slate-900">{text(course.schedule)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">选择报名方式</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { value: 'wallet' as const, label: '余额付款', description: '使用平台余额付款报名。', icon: Wallet },
              { value: 'invite' as const, label: '邀请码', description: '输入教师提供的邀请码报名。', icon: Check },
              { value: 'thirdParty' as const, label: '第三方支付', description: '使用微信或支付宝完成支付。', icon: Smartphone },
            ]).map((option) => {
              const Icon = option.icon
              const selected = checkoutMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`relative rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                  onClick={() => {
                    setCheckoutMode(option.value)
                    if (option.value === 'wallet') setPaymentMethod('wallet')
                    if (option.value === 'thirdParty' && paymentMethod === 'wallet') setPaymentMethod('wechat_pay')
                  }}
                >
                  <span className={`flex size-9 items-center justify-center rounded-full ${selected ? 'bg-white/15' : 'bg-slate-100'}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="mt-3 block font-medium">{option.label}</span>
                  <span className={`mt-1 block text-xs leading-5 ${selected ? 'text-white/75' : 'text-slate-500'}`}>{option.description}</span>
                  {selected ? <Check className="absolute right-3 top-3 size-4" /> : null}
                </button>
              )
            })}
          </div>
        </div>

        {checkoutMode === 'wallet' ? (
          <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">平台余额</p>
              <p className="text-xl font-semibold text-slate-950">￥{walletBalance}</p>
            </div>
            {walletInsufficient ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                余额不足，请先充值。
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                type="number"
                min={1}
                step={10}
                value={rechargeAmount}
                onChange={(event) => setRechargeAmount(event.target.value)}
                placeholder="输入充值金额"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-lg bg-white"
                onClick={() => rechargeWallet(Number(rechargeAmount))}
                disabled={isSubmitting}
              >
                充值
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {walletRechargeOptions.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white px-3"
                  onClick={() => setRechargeAmount(String(amount))}
                  disabled={isSubmitting}
                >
                  充 ￥{amount}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {checkoutMode === 'invite' ? (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-950">邀请码报名</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">如果课程设置了邀请码，请在这里输入。系统会校验邀请码后开通课程或进入对应审核流程。</p>
            </div>
            <Input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="输入课程邀请码"
            />
          </div>
        ) : null}

        {checkoutMode === 'thirdParty' ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-950">第三方支付</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.filter((method) => method !== 'wallet').map((method) => {
                const Icon = paymentMethodIcons[method]
                const selected = paymentMethod === method
                return (
                  <label
                    key={method}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      selected ? 'border-slate-950 bg-white text-slate-950 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="font-medium">{paymentMethodLabels[method]}</span>
                    {selected ? <Check className="absolute right-3 top-3 size-4" /> : null}
                    <input
                      type="radio"
                      name="third-party-payment-method"
                      value={method}
                      checked={selected}
                      onChange={() => setPaymentMethod(method)}
                      className="sr-only"
                    />
                  </label>
                )
              })}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              确认后会模拟完成第三方支付并提交报名。
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting || (checkoutMode === 'wallet' && walletInsufficient) || (checkoutMode === 'invite' && !inviteCode.trim())}
          >
            {isSubmitting ? '提交中...' : checkoutMode === 'invite' ? '提交邀请码并报名' : '确认支付并报名'}
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
