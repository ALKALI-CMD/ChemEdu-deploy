import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import BusinessMetricGrid from './components/BusinessMetricGrid'
import BusinessOrdersCard from './components/BusinessOrdersCard'
import BusinessPromotionCard from './components/BusinessPromotionCard'
import BusinessRecommendationCard from './components/BusinessRecommendationCard'
import BusinessResourceAssetCard from './components/BusinessResourceAssetCard'

export default function PlatformBusinessPanel({ dashboard }: { dashboard: EducationDashboardResponse }) {
  const { businessDashboard } = dashboard

  return (
    <div className="space-y-6">
      <BusinessMetricGrid businessDashboard={businessDashboard} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <BusinessOrdersCard orders={dashboard.orders} />
        <BusinessPromotionCard coupons={dashboard.coupons} promotions={dashboard.promotions} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BusinessRecommendationCard dashboard={dashboard} />
        <BusinessResourceAssetCard dashboard={dashboard} />
      </div>
    </div>
  )
}
