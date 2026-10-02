import { InlineNotice, type NoticeState } from '@/components/ExperienceState'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@/components/ui/UiComponents'
import { UserRole } from '@/objects/auth/UserRole'

export type ProfileFormErrors = Partial<Record<'name' | 'bio' | 'grade' | 'subject' | 'age', string>>

type ProfileEditFormCardProps = {
  role: UserRole
  directionLabel: string
  name: string
  age: string
  grade: string
  subject: string
  bio: string
  errors: ProfileFormErrors
  notice: NoticeState
  saving: boolean
  onNameChange: (value: string) => void
  onAgeChange: (value: string) => void
  onGradeChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onBioChange: (value: string) => void
  onSave: () => void
}

export default function ProfileEditFormCard({
  role,
  directionLabel,
  name,
  age,
  grade,
  subject,
  bio,
  errors,
  notice,
  saving,
  onNameChange,
  onAgeChange,
  onGradeChange,
  onSubjectChange,
  onBioChange,
  onSave,
}: ProfileEditFormCardProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-950">编辑资料</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <InlineNotice notice={notice} />

        <div className="grid gap-2">
          <Label htmlFor="profile-name">用户名（必填，至少 2 个字符）</Label>
          <Input id="profile-name" value={name} aria-invalid={Boolean(errors.name)} onChange={(event) => onNameChange(event.target.value)} />
          {errors.name ? <p className="text-xs text-red-700">{errors.name}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-age">年龄（选填，正整数）</Label>
          <Input id="profile-age" type="number" min={1} value={age} aria-invalid={Boolean(errors.age)} onChange={(event) => onAgeChange(event.target.value)} />
          {errors.age ? <p className="text-xs text-red-700">{errors.age}</p> : null}
        </div>

        {role === UserRole.Student ? (
          <div className="grid gap-2">
            <Label htmlFor="profile-grade">年级（学生必填）</Label>
            <Input id="profile-grade" value={grade} aria-invalid={Boolean(errors.grade)} onChange={(event) => onGradeChange(event.target.value)} />
            {errors.grade ? <p className="text-xs text-red-700">{errors.grade}</p> : null}
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="profile-subject">
            {directionLabel}
            {role === UserRole.Teacher ? '' : '（选填）'}
          </Label>
          <Input
            id="profile-subject"
            aria-invalid={Boolean(errors.subject)}
            placeholder={
              role === UserRole.Student
                ? '例如：前端开发、数据分析、课程设计'
                : role === UserRole.Teacher
                  ? '例如：软件工程、数据库系统'
                  : '例如：课程运营、教学支持'
            }
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
          />
          {errors.subject ? <p className="text-xs text-red-700">{errors.subject}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-bio">个人简介（必填）</Label>
          <Textarea
            id="profile-bio"
            className="min-h-28 bg-white"
            aria-invalid={Boolean(errors.bio)}
            placeholder="请说明你的学习/教学背景、关注方向或希望展示给其他用户的信息。"
            value={bio}
            onChange={(event) => onBioChange(event.target.value)}
          />
          {errors.bio ? <p className="text-xs text-red-700">{errors.bio}</p> : null}
        </div>

        <div className="flex justify-end">
          <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={onSave} disabled={saving}>
            {saving ? '保存中...' : '保存资料'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
