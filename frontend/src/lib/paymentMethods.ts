export const paymentMethods = ['wallet', 'wechat_pay', 'alipay'] as const

export type PaymentMethod = (typeof paymentMethods)[number]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  wallet: '平台余额',
  wechat_pay: '微信支付',
  alipay: '支付宝',
}
