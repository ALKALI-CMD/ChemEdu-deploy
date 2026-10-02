import { useMemo, useState } from 'react'
import type { Course } from '@/objects/course/catalog/Course'
import type { PaymentMethod } from '@/lib/paymentMethods'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { UserRole } from '@/objects/auth/UserRole'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { courseDiscoveryText, type PriceFilter, type QuickView, type SortKey } from '../../../../objects/courseDiscoveryConfig'

type UseCourseDiscoveryOptions = {
  dashboard: EducationDashboardResponse
  onEnroll: (courseId: Course['id'], paymentMethod?: PaymentMethod, inviteCode?: string) => Promise<void>
}

function uniqueNormalizedOptions(values: string[]) {
  const optionMap = new Map<string, string>()
  values.forEach((value) => {
    const normalizedValue = value.trim()
    const key = normalizedValue.toLowerCase()
    if (normalizedValue && !optionMap.has(key)) {
      optionMap.set(key, normalizedValue)
    }
  })
  return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b))
}

export function useCourseDiscovery({ dashboard, onEnroll }: UseCourseDiscoveryOptions) {
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all')
  const [teacherFilter, setTeacherFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('popular')
  const [quickView, setQuickView] = useState<QuickView>('all')
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null)
  const [paymentCourse, setPaymentCourse] = useState<Course | null>(null)

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        dashboard.enrollments
          .filter((item) => item.userId === dashboard.currentUser.id && item.status === 'enrolled')
          .map((item) => String(item.courseId)),
      ),
    [dashboard.currentUser.id, dashboard.enrollments],
  )

  const teacherNameMap = useMemo(
    () => new Map(dashboard.users.map((user) => [String(user.id), courseDiscoveryText(user.name)])),
    [dashboard.users],
  )

  const visibleCourses = useMemo(() => {
    if (dashboard.currentUser.role === UserRole.Student) {
      return dashboard.courses.filter((course) => course.status === CourseStatus.Published)
    }
    return dashboard.courses
  }, [dashboard.courses, dashboard.currentUser.role])

  const categories = useMemo(
    () => uniqueNormalizedOptions(visibleCourses.map((course) => courseDiscoveryText(course.category))),
    [visibleCourses],
  )

  const teacherOptions = useMemo(
    () => uniqueNormalizedOptions(visibleCourses.map((course) => teacherNameMap.get(String(course.teacherId)) ?? '')),
    [teacherNameMap, visibleCourses],
  )

  const filteredCourses = useMemo(() => {
    const loweredKeyword = keyword.trim().toLowerCase()

    const courses = visibleCourses.filter((course, index) => {
      const teacherName = teacherNameMap.get(String(course.teacherId)) ?? '未分配教师'
      const matchesKeyword =
        loweredKeyword.length === 0 ||
        courseDiscoveryText(course.title).toLowerCase().includes(loweredKeyword) ||
        courseDiscoveryText(course.subtitle).toLowerCase().includes(loweredKeyword) ||
        courseDiscoveryText(course.description).toLowerCase().includes(loweredKeyword) ||
        teacherName.toLowerCase().includes(loweredKeyword)

      const matchesCategory = categoryFilter === 'all' || courseDiscoveryText(course.category) === categoryFilter
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter
      const matchesTeacher = teacherFilter === 'all' || teacherName === teacherFilter

      const price = Number(course.price)
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && price === 0) ||
        (priceFilter === 'paid' && price > 0) ||
        (priceFilter === 'budget' && price > 0 && price <= 99) ||
        (priceFilter === 'premium' && price >= 100)

      const matchesQuickView =
        quickView === 'all' ||
        (quickView === 'popular' && course.enrolledCount >= 20) ||
        (quickView === 'latest' && index >= Math.max(0, visibleCourses.length - 4)) ||
        (quickView === 'free' && price === 0) ||
        (quickView === 'rating' && Number(course.rating) >= 4.6)

      return matchesKeyword && matchesCategory && matchesStatus && matchesTeacher && matchesPrice && matchesQuickView
    })

    return [...courses].sort((left, right) => {
      if (sortKey === 'latest') {
        return visibleCourses.indexOf(right) - visibleCourses.indexOf(left)
      }
      if (sortKey === 'priceAsc') return Number(left.price) - Number(right.price)
      if (sortKey === 'priceDesc') return Number(right.price) - Number(left.price)
      if (sortKey === 'rating') return Number(right.rating) - Number(left.rating) || right.enrolledCount - left.enrolledCount
      return right.enrolledCount - left.enrolledCount || Number(right.rating) - Number(left.rating)
    })
  }, [categoryFilter, keyword, priceFilter, quickView, sortKey, statusFilter, teacherFilter, teacherNameMap, visibleCourses])

  function resetFilters() {
    setKeyword('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setTeacherFilter('all')
    setPriceFilter('all')
    setSortKey('popular')
    setQuickView('all')
  }

  function setQuickViewWithEffects(value: QuickView) {
    setQuickView(value)
    if (value === 'latest') setSortKey('latest')
    if (value === 'rating') setSortKey('rating')
    if (value === 'popular') setSortKey('popular')
    if (value === 'free') setPriceFilter('free')
  }

  async function handleEnroll(course: Course) {
    if (Number(course.price) > 0) {
      setPaymentCourse(course)
      return
    }

    setPendingCourseId(String(course.id))
    try {
      await onEnroll(course.id)
    } finally {
      setPendingCourseId(null)
    }
  }

  async function handleConfirmPayment(paymentMethod?: PaymentMethod, inviteCode?: string) {
    if (!paymentCourse) {
      return
    }

    setPendingCourseId(String(paymentCourse.id))
    try {
      await onEnroll(paymentCourse.id, paymentMethod, inviteCode)
      setPaymentCourse(null)
    } finally {
      setPendingCourseId(null)
    }
  }

  return {
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
  }
}
