import type { Course } from '@/objects/course/catalog/Course'
import { Input, Label, Textarea } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

type AssignmentBasicFieldsProps = {
  courseOptions: Course[]
  assignmentCourseId: string
  assignmentTitle: string
  assignmentDescription: string
  assignmentDeadline: string
  assignmentAttachmentLabel: string
  assignmentReferenceLabels: string
  onCourseIdChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDeadlineChange: (value: string) => void
  onAttachmentLabelChange: (value: string) => void
  onReferenceLabelsChange: (value: string) => void
}

export default function AssignmentBasicFields({
  courseOptions,
  assignmentCourseId,
  assignmentTitle,
  assignmentDescription,
  assignmentDeadline,
  assignmentAttachmentLabel,
  assignmentReferenceLabels,
  onCourseIdChange,
  onTitleChange,
  onDescriptionChange,
  onDeadlineChange,
  onAttachmentLabelChange,
  onReferenceLabelsChange,
}: AssignmentBasicFieldsProps) {
  return (
    <>
      <Label htmlFor="assignment-course">所属课程（必填）</Label>
      <select
        id="assignment-course"
        required
        aria-required="true"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        value={assignmentCourseId}
        onChange={(event) => onCourseIdChange(event.target.value)}
      >
        {courseOptions.map((course) => (
          <option key={course.id} value={course.id}>
            {zh(course.title)}
          </option>
        ))}
      </select>

      <Label htmlFor="assignment-title">作业标题（必填）</Label>
      <Input
        id="assignment-title"
        required
        aria-required="true"
        value={assignmentTitle}
        onChange={(event) => onTitleChange(event.target.value)}
      />

      <Label htmlFor="assignment-description">作业要求（必填）</Label>
      <Textarea
        id="assignment-description"
        required
        aria-required="true"
        className="min-h-24 bg-white"
        value={assignmentDescription}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />

      <Label htmlFor="assignment-deadline">截止时间（必填）</Label>
      <Input
        id="assignment-deadline"
        required
        aria-required="true"
        type="datetime-local"
        value={assignmentDeadline}
        onChange={(event) => onDeadlineChange(event.target.value)}
      />

      <Label htmlFor="assignment-attachment">附件说明（选填）</Label>
      <Input
        id="assignment-attachment"
        placeholder="例如：实验说明.pdf"
        value={assignmentAttachmentLabel}
        onChange={(event) => onAttachmentLabelChange(event.target.value)}
      />

      <Label htmlFor="assignment-reference-labels">参考资料列表（选填）</Label>
      <Input
        id="assignment-reference-labels"
        placeholder="讲义.pdf, 示例代码.zip"
        value={assignmentReferenceLabels}
        onChange={(event) => onReferenceLabelsChange(event.target.value)}
      />
    </>
  )
}
