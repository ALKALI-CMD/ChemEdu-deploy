import PaymentConfirmDialog from '@/components/PaymentConfirmDialog'
import type { Course } from '@/objects/course/catalog/Course'
import type { PaymentMethod } from '@/lib/paymentMethods'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import CourseEmptyState from './components/CourseEmptyState'
import CourseResults from './components/CourseResults'
import QuickFiltersSection from './components/QuickFiltersSection'
import { useCourseDiscovery } from './hooks/useCourseDiscovery'

type CourseGridProps = {
  dashboard: EducationDashboardResponse
  onEnroll: (courseId: Course['id'], paymentMethod?: PaymentMethod, inviteCode?: string) => Promise<void>
}

export default function CourseGrid({ dashboard, onEnroll }: CourseGridProps) {
  const {
    keyword,
    setKeyword,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    teacherFilter,
    setTeacherFilter,
    priceFilter,
    setPriceFilter,
    sortKey,
    setSortKey,
    quickView,
    setQuickViewWithEffects,
    pendingCourseId,
    paymentCourse,
    setPaymentCourse,
    enrolledCourseIds,
    teacherNameMap,
    visibleCourses,
    categories,
    teacherOptions,
    filteredCourses,
    resetFilters,
    handleEnroll,
    handleConfirmPayment,
  } = useCourseDiscovery({ dashboard, onEnroll })

  return (
    <div className="space-y-5">
      <QuickFiltersSection
        keyword={keyword}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        teacherFilter={teacherFilter}
        priceFilter={priceFilter}
        sortKey={sortKey}
        quickView={quickView}
        categories={categories}
        teacherOptions={teacherOptions}
        resultCount={filteredCourses.length}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onTeacherChange={setTeacherFilter}
        onPriceChange={setPriceFilter}
        onSortChange={setSortKey}
        onQuickViewChange={setQuickViewWithEffects}
        onReset={resetFilters}
      />

      {filteredCourses.length === 0 ? (
        <CourseEmptyState onReset={resetFilters} />
      ) : (
        <CourseResults
          courses={filteredCourses}
          currentRole={dashboard.currentUser.role}
          enrolledCourseIds={enrolledCourseIds}
          teacherNameMap={teacherNameMap}
          pendingCourseId={pendingCourseId}
          onEnroll={handleEnroll}
        />
      )}

      <PaymentConfirmDialog
        course={paymentCourse ?? visibleCourses[0]}
        userId={String(dashboard.currentUser.id)}
        isOpen={Boolean(paymentCourse)}
        isSubmitting={pendingCourseId === String(paymentCourse?.id)}
        onClose={() => {
          if (!pendingCourseId) {
            setPaymentCourse(null)
          }
        }}
        onConfirm={handleConfirmPayment}
      />
    </div>
  )
}
