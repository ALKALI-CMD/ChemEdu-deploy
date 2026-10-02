import { useEffect, useState } from 'react'
import { type NoticeState, useAutoClearNotice } from '@/components/ExperienceState'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { UserRole } from '@/objects/auth/UserRole'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { fileToDataUrl, readAvatar, saveAvatar } from '@/lib/local-media'
import { readWalletBalance, rechargeWalletBalance } from '@/lib/wallet'
import { cropAvatarImage, getDirectionLabel } from '../functions/profilePanelUtils'

type ProfileFieldErrors = Partial<Record<'name' | 'bio' | 'grade' | 'subject' | 'age', string>>

export function useProfilePanelState(dashboard: EducationDashboardResponse) {
  const { updateProfile, changePassword } = useEducationDashboard()
  const currentUser = dashboard.currentUser

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [walletBalance, setWalletBalance] = useState(() => readWalletBalance(String(currentUser.id)))
  const [rechargeAmount, setRechargeAmount] = useState('100')
  const [avatar, setAvatar] = useState<string | null>(() => currentUser.avatarUrl ?? readAvatar(String(currentUser.id)))
  const [profileErrors, setProfileErrors] = useState<ProfileFieldErrors>({})
  const [avatarCropSource, setAvatarCropSource] = useState<string | null>(null)
  const [avatarCropX, setAvatarCropX] = useState(50)
  const [avatarCropY, setAvatarCropY] = useState(50)
  const [avatarCropZoom, setAvatarCropZoom] = useState(1)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [profileNotice, setProfileNotice] = useState<NoticeState>(null)
  const [passwordNotice, setPasswordNotice] = useState<NoticeState>(null)
  const directionLabel = getDirectionLabel(currentUser.role)

  useAutoClearNotice(profileNotice, setProfileNotice)
  useAutoClearNotice(passwordNotice, setPasswordNotice)

  useEffect(() => {
    setName(currentUser.name)
    setAge(currentUser.age !== undefined ? String(currentUser.age) : '')
    setGrade(currentUser.grade ?? '')
    setSubject(currentUser.subject ?? '')
    setBio(currentUser.bio)
    setAvatar(currentUser.avatarUrl ?? readAvatar(String(currentUser.id)))
  }, [currentUser.age, currentUser.avatarUrl, currentUser.bio, currentUser.grade, currentUser.id, currentUser.name, currentUser.subject])

  useEffect(() => {
    setWalletBalance(readWalletBalance(String(currentUser.id)))
  }, [currentUser.id])

  function handleRecharge(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return
    setWalletBalance((current) => rechargeWalletBalance(String(currentUser.id), current, amount))
  }

  async function handleAvatarSelect(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setAvatarCropSource(dataUrl)
    setAvatarCropX(50)
    setAvatarCropY(50)
    setAvatarCropZoom(1)
  }

  async function handleSaveAvatarCrop() {
    if (!avatarCropSource) return
    setAvatarSaving(true)
    try {
      const croppedAvatar = await cropAvatarImage(avatarCropSource, avatarCropX, avatarCropY, avatarCropZoom)
      saveAvatar(String(currentUser.id), croppedAvatar)
      await updateProfile({
        name,
        age: age.trim() ? Number(age) : undefined,
        grade: currentUser.role === UserRole.Student ? grade : undefined,
        subject: subject.trim() ? subject : undefined,
        bio,
        avatarUrl: croppedAvatar,
      })
      setAvatar(croppedAvatar)
      setAvatarCropSource(null)
      setProfileNotice({ tone: 'success', title: '头像已更新', message: '头像已更新。' })
    } catch (error) {
      setProfileNotice({
        tone: 'error',
        title: '头像更新失败',
        message: error instanceof Error ? error.message : '裁剪头像时出现未知错误。',
      })
    } finally {
      setAvatarSaving(false)
    }
  }

  async function handleSaveProfile() {
    setProfileNotice(null)
    const nextErrors: ProfileFieldErrors = {}

    if (!name.trim()) nextErrors.name = '用户名必填，至少 2 个字符。'
    else if (name.trim().length < 2) nextErrors.name = '用户名至少需要 2 个字符。'
    if (!bio.trim()) nextErrors.bio = '个人简介必填，请写明你的学习/教学背景。'
    if (currentUser.role === UserRole.Student && !grade.trim()) nextErrors.grade = '学生账号必须填写年级。'
    if (currentUser.role === UserRole.Teacher && !subject.trim()) nextErrors.subject = '教师账号必须填写授课方向。'

    const parsedAge = age.trim() ? Number(age) : undefined
    if (parsedAge !== undefined && (!Number.isInteger(parsedAge) || parsedAge <= 0)) {
      nextErrors.age = '年龄需要是正整数。'
    }

    setProfileErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setProfileNotice({ tone: 'error', title: '资料未保存', message: '请根据输入框下方的提示修改后再保存。' })
      return
    }

    setProfileSaving(true)
    try {
      await updateProfile({
        name,
        age: parsedAge,
        grade: currentUser.role === UserRole.Student ? grade : undefined,
        subject: subject.trim() ? subject : undefined,
        bio,
        avatarUrl: avatar ?? undefined,
      })
      setProfileNotice({ tone: 'success', title: '资料已更新', message: '资料已更新。' })
    } catch (error) {
      setProfileNotice({
        tone: 'error',
        title: '资料更新失败',
        message: error instanceof Error ? error.message : '保存资料时出现未知错误。',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword() {
    setPasswordNotice(null)

    if (!currentPassword.trim()) {
      setPasswordNotice({ tone: 'error', title: '密码未更新', message: '请填写当前密码。' })
      return
    }
    if (!newPassword.trim()) {
      setPasswordNotice({ tone: 'error', title: '密码未更新', message: '请填写新密码。' })
      return
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword) || newPassword.length < 8) {
      setPasswordNotice({ tone: 'error', title: '密码未更新', message: '新密码至少 8 位，且必须同时包含字母和数字。' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ tone: 'error', title: '密码未更新', message: '两次输入的新密码不一致。' })
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordNotice({ tone: 'success', title: '密码已更新', message: '新密码已经生效。下次登录时请使用新的密码。' })
    } catch (error) {
      setPasswordNotice({
        tone: 'error',
        title: '密码更新失败',
        message: error instanceof Error ? error.message : '修改密码时出现未知错误。',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  return {
    avatar,
    avatarCropSource,
    avatarCropX,
    avatarCropY,
    avatarCropZoom,
    avatarSaving,
    bio,
    confirmPassword,
    currentPassword,
    currentUser,
    directionLabel,
    grade,
    handleAvatarSelect,
    handleChangePassword,
    handleRecharge,
    handleSaveAvatarCrop,
    handleSaveProfile,
    name,
    age,
    newPassword,
    passwordNotice,
    passwordSaving,
    profileErrors,
    profileNotice,
    profileSaving,
    rechargeAmount,
    setAvatarCropSource,
    setAvatarCropX,
    setAvatarCropY,
    setAvatarCropZoom,
    setBio,
    setConfirmPassword,
    setCurrentPassword,
    setGrade,
    setName,
    setAge,
    setNewPassword,
    setRechargeAmount,
    setSubject,
    subject,
    walletBalance,
  }
}
