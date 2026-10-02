import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import AvatarCropDialog from './components/AvatarCropDialog'
import PasswordChangeFormCard from './components/PasswordChangeFormCard'
import ProfileAccountOverviewPanel from './components/ProfileAccountOverviewPanel'
import ProfileEditFormCard from './components/ProfileEditFormCard'
import { useProfilePanelState } from './hooks/useProfilePanelState'

type ProfilePanelProps = {
  dashboard: EducationDashboardResponse
}

export default function ProfilePanel({ dashboard }: ProfilePanelProps) {
  const profile = useProfilePanelState(dashboard)

  return (
    <section className="grid gap-6">
      <ProfileAccountOverviewPanel
        currentUser={profile.currentUser}
        avatar={profile.avatar}
        walletBalance={profile.walletBalance}
        rechargeAmount={profile.rechargeAmount}
        onRechargeAmountChange={profile.setRechargeAmount}
        onRecharge={profile.handleRecharge}
        onAvatarSelect={(files) => void profile.handleAvatarSelect(files)}
      />

      <div className="grid gap-6">
        <ProfileEditFormCard
          role={profile.currentUser.role}
          directionLabel={profile.directionLabel}
          name={profile.name}
          age={profile.age}
          grade={profile.grade}
          subject={profile.subject}
          bio={profile.bio}
          errors={profile.profileErrors}
          notice={profile.profileNotice}
          saving={profile.profileSaving}
          onNameChange={profile.setName}
          onAgeChange={profile.setAge}
          onGradeChange={profile.setGrade}
          onSubjectChange={profile.setSubject}
          onBioChange={profile.setBio}
          onSave={() => void profile.handleSaveProfile()}
        />

        <PasswordChangeFormCard
          currentPassword={profile.currentPassword}
          newPassword={profile.newPassword}
          confirmPassword={profile.confirmPassword}
          notice={profile.passwordNotice}
          saving={profile.passwordSaving}
          onCurrentPasswordChange={profile.setCurrentPassword}
          onNewPasswordChange={profile.setNewPassword}
          onConfirmPasswordChange={profile.setConfirmPassword}
          onSave={() => void profile.handleChangePassword()}
        />
      </div>

      <AvatarCropDialog
        source={profile.avatarCropSource}
        cropX={profile.avatarCropX}
        cropY={profile.avatarCropY}
        cropZoom={profile.avatarCropZoom}
        saving={profile.avatarSaving}
        onOpenChange={(open) => {
          if (!open) profile.setAvatarCropSource(null)
        }}
        onCropXChange={profile.setAvatarCropX}
        onCropYChange={profile.setAvatarCropY}
        onCropZoomChange={profile.setAvatarCropZoom}
        onSave={() => void profile.handleSaveAvatarCrop()}
      />
    </section>
  )
}
