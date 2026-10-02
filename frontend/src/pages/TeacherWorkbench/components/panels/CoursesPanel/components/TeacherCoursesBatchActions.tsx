import { Button } from '@/components/ui/UiComponents'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import TeacherActionGroup from './teacher/TeacherActionGroup'

type TeacherCoursesBatchActionsProps = {
  selectedCourseIdsCount: number
  selectedInFilteredCount: number
  allFilteredSelected: boolean
  filteredCourseIds: string[]
  canManage: boolean
  batchUpdating: boolean
  onToggleSelectAll: () => void
  onBatchStatusChange: (nextStatus: CourseStatus) => void
}

export default function TeacherCoursesBatchActions({
  selectedCourseIdsCount,
  selectedInFilteredCount,
  allFilteredSelected,
  filteredCourseIds,
  canManage,
  batchUpdating,
  onToggleSelectAll,
  onBatchStatusChange,
}: TeacherCoursesBatchActionsProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-slate-950">批量操作</p>
          <p className="text-sm leading-6 text-slate-600">
            已选 {selectedCourseIdsCount} 门
          </p>
        </div>
        <TeacherActionGroup>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            onClick={onToggleSelectAll}
            disabled={filteredCourseIds.length === 0}
          >
            {allFilteredSelected ? '清空选择' : '全选'}
          </Button>
          <Button
            type="button"
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            onClick={() => onBatchStatusChange(CourseStatus.Published)}
            disabled={!canManage || batchUpdating || selectedInFilteredCount === 0}
          >
            批量提交发布
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => onBatchStatusChange(CourseStatus.Draft)}
            disabled={!canManage || batchUpdating || selectedInFilteredCount === 0}
          >
            批量转为草稿
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => onBatchStatusChange(CourseStatus.Archived)}
            disabled={!canManage || batchUpdating || selectedInFilteredCount === 0}
          >
            批量下架
          </Button>
        </TeacherActionGroup>
      </div>
    </div>
  )
}
