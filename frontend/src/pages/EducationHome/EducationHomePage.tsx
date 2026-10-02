import EducationPageGuard from '@/components/EducationPageGuard'
import EducationShell from '@/components/EducationShell'
import HeroPanel from './components/panels/HeroPanel/HeroPanel'

export default function EducationHome() {
  return (
    <EducationPageGuard title="工作入口" description="按角色进入对应功能。" loadingVariant="courses">
      {(dashboard) => (
        <EducationShell eyebrow="工作入口" title="工作入口" description="按角色进入对应功能。">
          <div className="space-y-8">
            <HeroPanel dashboard={dashboard} />
          </div>
        </EducationShell>
      )}
    </EducationPageGuard>
  )
}
