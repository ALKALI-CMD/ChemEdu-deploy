import { UserRole } from '@/objects/auth/UserRole'
import { Input, Textarea } from '@/components/ui/UiComponents'
import type { AuthFieldErrors } from '../functions/authPanelModel'

const studentGradeOptions = ['大一', '大二', '大三', '大四']

type AuthRegisterFieldsProps = {
  role: UserRole
  grade: string
  subject: string
  bio: string
  fieldErrors: AuthFieldErrors
  onRoleChange: (value: UserRole) => void
  onGradeChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onBioChange: (value: string) => void
}

export default function AuthRegisterFields({
  role,
  grade,
  subject,
  bio,
  fieldErrors,
  onRoleChange,
  onGradeChange,
  onSubjectChange,
  onBioChange,
}: AuthRegisterFieldsProps) {
  const profileLabel = role === UserRole.Student ? '年级' : role === UserRole.Teacher ? '授课方向' : '辅助方向（选填）'
  const profilePlaceholder = role === UserRole.Student ? undefined : role === UserRole.Teacher ? '例如：软件工程' : '例如：课程答疑、作业辅导'
  const profileValue = role === UserRole.Student ? grade : subject
  const bioPlaceholder =
    role === UserRole.Student
      ? '写一句你的学习目标或兴趣方向'
      : role === UserRole.Teacher
        ? '写一句你的教学方向或课程经验'
        : '写一句你的教学辅助经验或擅长方向'

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700" htmlFor="auth-role">
            角色
          </label>
          <select
            id="auth-role"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={role}
            onChange={(event) => onRoleChange(event.target.value as UserRole)}
          >
            <option value={UserRole.Student}>学生</option>
            <option value={UserRole.Teacher}>教研老师</option>
            <option value={UserRole.Assistant}>助教老师</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700" htmlFor="auth-profile">
            {profileLabel}
          </label>
          {role === UserRole.Student ? (
            <select
              id="auth-profile"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              aria-invalid={Boolean(fieldErrors.profile)}
              value={grade}
              onChange={(event) => onGradeChange(event.target.value)}
            >
              {studentGradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="auth-profile"
              aria-invalid={Boolean(fieldErrors.profile)}
              placeholder={profilePlaceholder}
              value={profileValue}
              onChange={(event) => onSubjectChange(event.target.value)}
            />
          )}
          {fieldErrors.profile ? <p className="text-xs text-red-600">{fieldErrors.profile}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="auth-bio">
          个人介绍（选填）
        </label>
        <Textarea
          id="auth-bio"
          className="min-h-24"
          placeholder={bioPlaceholder}
          value={bio}
          onChange={(event) => onBioChange(event.target.value)}
        />
        {fieldErrors.bio ? <p className="text-xs text-red-600">{fieldErrors.bio}</p> : null}
      </div>
    </>
  )
}
