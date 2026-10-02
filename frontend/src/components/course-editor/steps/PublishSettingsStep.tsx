import type { UserId } from '@/objects/auth/UserId'
import type { UserProfile } from '@/objects/auth/UserProfile'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import { UserRole } from '@/objects/auth/UserRole'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { Input, Label } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

type PublishSettingsStepProps = {
  title: string
  form: CourseEditorInput
  setForm: React.Dispatch<React.SetStateAction<CourseEditorInput>>
  assistantUsers: UserProfile[]
  allowDirectPublish: boolean
  totalLessons: number
  handleToggleAssistant: (assistantId: UserId) => void
}

export default function PublishSettingsStep({
  title,
  form,
  setForm,
  assistantUsers,
  allowDirectPublish,
  totalLessons,
  handleToggleAssistant,
}: PublishSettingsStepProps) {
  const assistantOptions = assistantUsers.filter((user) => user.role !== UserRole.Admin && user.role !== UserRole.Teacher)
  const knownAssistantIds = new Set(assistantOptions.map((user) => user.id))
  const unknownAssistantIds = form.assistants.filter((assistantId) => !knownAssistantIds.has(assistantId))

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${title}-semester-label`}>学期（选填）</Label>
          <Input
            id={`${title}-semester-label`}
            placeholder="如 2026 春"
            value={form.semesterLabel ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, semesterLabel: event.target.value || undefined }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${title}-offering-code`}>开课批次（选填）</Label>
          <Input
            id={`${title}-offering-code`}
            placeholder="如 SE-2026-01"
            value={form.offeringCode ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, offeringCode: event.target.value || undefined }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-capacity`}>容量（必填）</Label>
          <Input
            id={`${title}-course-capacity`}
            required
            aria-required="true"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(event) => setForm((prev) => ({ ...prev, capacity: Math.max(1, Number(event.target.value) || 1) }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-tags`}>课程标签（选填）</Label>
          <Input
            id={`${title}-course-tags`}
            placeholder="多个标签用逗号分隔"
            value={form.tags.join(',')}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                tags: event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label>课程助教邀请（选填）</Label>
          <div className="min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {assistantOptions.length === 0 ? (
              <p className="text-slate-500">当前没有可邀请用户。</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assistantOptions.map((assistant) => (
                  <label
                    key={assistant.id}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.assistants.includes(assistant.id)}
                      onChange={() => handleToggleAssistant(assistant.id)}
                    />
                    <span>{zh(assistant.name)}</span>
                  </label>
                ))}
              </div>
            )}
            {unknownAssistantIds.length > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                当前课程包含未出现在用户列表中的历史助教 ID：{unknownAssistantIds.join('、')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-status`}>课程状态（必填）</Label>
          <select
            id={`${title}-course-status`}
            required
            aria-required="true"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as CourseStatus }))}
          >
            <option value={CourseStatus.Draft}>草稿</option>
            {allowDirectPublish ? <option value={CourseStatus.Published}>已发布</option> : null}
            <option value={CourseStatus.Archived}>已下架</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-starts-at`}>开课时间（选填）</Label>
          <Input
            id={`${title}-course-starts-at`}
            placeholder="2026-03-01T19:00:00Z"
            value={form.startsAt ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value || undefined }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-course-ends-at`}>结课时间（选填）</Label>
          <Input
            id={`${title}-course-ends-at`}
            placeholder="2026-06-20T21:00:00Z"
            value={form.endsAt ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value || undefined }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-enroll-open-at`}>选课开放（选填）</Label>
          <Input
            id={`${title}-enroll-open-at`}
            placeholder="2026-02-20T00:00:00Z"
            value={form.enrollmentPolicy.openAt ?? ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                enrollmentPolicy: { ...prev.enrollmentPolicy, openAt: event.target.value || undefined },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-enroll-close-at`}>选课截止（选填）</Label>
          <Input
            id={`${title}-enroll-close-at`}
            placeholder="2026-03-31T23:59:59Z"
            value={form.enrollmentPolicy.closeAt ?? ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                enrollmentPolicy: { ...prev.enrollmentPolicy, closeAt: event.target.value || undefined },
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={form.enrollmentPolicy.requiresApproval}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                enrollmentPolicy: { ...prev.enrollmentPolicy, requiresApproval: event.target.checked },
              }))
            }
          />
          <span>报名需审核</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={form.enrollmentPolicy.waitlistEnabled}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                enrollmentPolicy: { ...prev.enrollmentPolicy, waitlistEnabled: event.target.checked },
              }))
            }
          />
          <span>开启候补</span>
        </label>
        <div className="grid gap-2">
          <Label htmlFor={`${title}-invite-code`}>邀请码（选填）</Label>
          <Input
            id={`${title}-invite-code`}
            placeholder="选填"
            value={form.enrollmentPolicy.inviteCode ?? ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                enrollmentPolicy: { ...prev.enrollmentPolicy, inviteCode: event.target.value || undefined },
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">课程标题</p>
          <p className="mt-2 font-semibold text-slate-950">{form.title || '未填写'}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">章节与课时</p>
          <p className="mt-2 font-semibold text-slate-950">
            {form.modules.length} 个章节 / {totalLessons} 个课时
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">发布结果</p>
          <p className="mt-2 font-semibold text-slate-950">
            {form.status === CourseStatus.Published
              ? '准备公开发布'
              : form.status === CourseStatus.Archived
                ? '保存为下架状态'
                : '保存为草稿'}
          </p>
        </div>
      </div>
    </div>
  )
}
