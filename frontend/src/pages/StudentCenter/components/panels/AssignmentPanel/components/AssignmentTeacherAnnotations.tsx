import type { Assignment } from '@/objects/course/learning/Assignment'
import { zh } from '@/lib/localization'

type AssignmentTeacherAnnotationsProps = {
  assignment: Assignment
}

export default function AssignmentTeacherAnnotations({ assignment }: AssignmentTeacherAnnotationsProps) {
  if (assignment.teacherAnnotations.length === 0) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">教师批注</p>
      {assignment.teacherAnnotations.map((annotation) => (
        <div key={annotation.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{annotation.author}</p>
          <p className="mt-1 leading-6">{zh(annotation.body)}</p>
        </div>
      ))}
    </div>
  )
}
