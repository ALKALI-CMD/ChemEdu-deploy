import { Input, Label, Switch } from '@/components/ui/UiComponents'

type AssignmentSubmissionPolicyFieldsProps = {
  assignmentMaxAttempts: string
  allowLateSubmission: boolean
  allowResubmission: boolean
  allowMakeUpSubmission: boolean
  lateSubmissionDeadline: string
  latePenaltyPercentPerDay: string
  latePenaltyCapPercent: string
  onMaxAttemptsChange: (value: string) => void
  onAllowLateSubmissionChange: (value: boolean) => void
  onAllowResubmissionChange: (value: boolean) => void
  onAllowMakeUpSubmissionChange: (value: boolean) => void
  onLateSubmissionDeadlineChange: (value: string) => void
  onLatePenaltyPercentPerDayChange: (value: string) => void
  onLatePenaltyCapPercentChange: (value: string) => void
}

export default function AssignmentSubmissionPolicyFields({
  assignmentMaxAttempts,
  allowLateSubmission,
  allowResubmission,
  allowMakeUpSubmission,
  lateSubmissionDeadline,
  latePenaltyPercentPerDay,
  latePenaltyCapPercent,
  onMaxAttemptsChange,
  onAllowLateSubmissionChange,
  onAllowResubmissionChange,
  onAllowMakeUpSubmissionChange,
  onLateSubmissionDeadlineChange,
  onLatePenaltyPercentPerDayChange,
  onLatePenaltyCapPercentChange,
}: AssignmentSubmissionPolicyFieldsProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="assignment-attempts">最多提交次数（必填）</Label>
          <Input
            id="assignment-attempts"
            required
            aria-required="true"
            type="number"
            min={1}
            value={assignmentMaxAttempts}
            onChange={(event) => onMaxAttemptsChange(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <Label htmlFor="assignment-late" className="text-sm">
            允许迟交
          </Label>
          <Switch id="assignment-late" checked={allowLateSubmission} onCheckedChange={onAllowLateSubmissionChange} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <Label htmlFor="assignment-resubmit" className="text-sm">
            允许重做
          </Label>
          <Switch id="assignment-resubmit" checked={allowResubmission} onCheckedChange={onAllowResubmissionChange} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <Label htmlFor="assignment-makeup" className="text-sm">
            允许补交
          </Label>
          <Switch id="assignment-makeup" checked={allowMakeUpSubmission} onCheckedChange={onAllowMakeUpSubmissionChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assignment-late-deadline">补交截止时间（选填）</Label>
          <Input
            id="assignment-late-deadline"
            type="datetime-local"
            value={lateSubmissionDeadline}
            onChange={(event) => onLateSubmissionDeadlineChange(event.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:col-span-1 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="assignment-late-penalty">迟交日扣减%（选填）</Label>
            <Input
              id="assignment-late-penalty"
              type="number"
              min={0}
              max={100}
              value={latePenaltyPercentPerDay}
              onChange={(event) => onLatePenaltyPercentPerDayChange(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignment-late-cap">扣减上限%（选填）</Label>
            <Input
              id="assignment-late-cap"
              type="number"
              min={0}
              max={100}
              value={latePenaltyCapPercent}
              onChange={(event) => onLatePenaltyCapPercentChange(event.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
